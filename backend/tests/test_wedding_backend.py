"""Backend API tests for Veronica's Dream Wedding planner."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://planner-tool-sana.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
def test_root_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# ---------- Seed idempotency (run first to ensure seeded) ----------
def test_seed_idempotent(client):
    r1 = client.post(f"{API}/seed", params={"reset": "false"})
    assert r1.status_code == 200
    v1 = client.get(f"{API}/vendors").json()
    r2 = client.post(f"{API}/seed", params={"reset": "false"})
    assert r2.status_code == 200
    v2 = client.get(f"{API}/vendors").json()
    assert len(v1) == len(v2), "Seed is not idempotent - vendor count changed"
    # Ensure we have at least the 6 seed vendors
    assert len(v2) >= 6


# ---------- Project ----------
def test_project_defaults(client):
    r = client.get(f"{API}/project")
    assert r.status_code == 200
    data = r.json()
    assert "_id" not in data
    assert data["id"] == "singleton"
    assert data["guest_count"] == 50
    assert data["target_budget"] == 15000.0
    assert "Veronica" in data["couple_names"]


def test_project_update(client):
    payload = {
        "couple_names": "Veronica & You",
        "wedding_date": "2026-06-20",
        "guest_count": 50,
        "target_budget": 15000.0,
    }
    r = client.put(f"{API}/project", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["couple_names"] == "Veronica & You"
    assert data["wedding_date"] == "2026-06-20"
    assert data["guest_count"] == 50
    # Verify persisted
    g = client.get(f"{API}/project").json()
    assert g["wedding_date"] == "2026-06-20"


# ---------- Categories & Goals ----------
def test_dream_categories(client):
    r = client.get(f"{API}/dream-categories")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    for c in data:
        assert "id" in c and "name" in c


def test_dream_goals(client):
    r = client.get(f"{API}/dream-goals")
    assert r.status_code == 200
    goals = r.json()
    cats = {c["id"] for c in client.get(f"{API}/dream-categories").json()}
    assert isinstance(goals, list) and len(goals) > 0
    for g in goals:
        assert "category" in g
        assert g["category"] in cats, f"goal {g['id']} references unknown category {g['category']}"


# ---------- Vendors ----------
EXPECTED_SERVICE_COUNTS = {
    "La Locanda del Nocciolo": 12,
    "Heart of Gold — Music": 6,
    "Max / Maximilliano — Photography": 3,
    "Sonia Ricci — Live Sketching": 4,
    "Symon Mattio — Flower by Sym": 4,
    "Davide Giuseppe Tolis — Il fotografo di matrimoni": 1,
}


def test_vendors_seeded(client):
    r = client.get(f"{API}/vendors")
    assert r.status_code == 200
    vendors = r.json()
    names = {v["name"]: v for v in vendors}
    for name, count in EXPECTED_SERVICE_COUNTS.items():
        assert name in names, f"Missing seeded vendor: {name}"
        assert len(names[name]["services"]) == count, (
            f"{name}: expected {count} services, got {len(names[name]['services'])}"
        )
        # No _id leakage
        assert "_id" not in names[name]
        for s in names[name]["services"]:
            assert "_id" not in s


def test_vendor_crud(client):
    # Create
    create = {"name": "TEST_Vendor", "categories": ["other"], "status": "new"}
    r = client.post(f"{API}/vendors", json=create)
    assert r.status_code == 200
    v = r.json()
    vid = v["id"]
    assert v["name"] == "TEST_Vendor"
    # Get
    g = client.get(f"{API}/vendors/{vid}")
    assert g.status_code == 200
    assert g.json()["name"] == "TEST_Vendor"
    # Update
    u = client.put(f"{API}/vendors/{vid}", json={"status": "shortlisted", "notes": "hello"})
    assert u.status_code == 200
    assert u.json()["status"] == "shortlisted"
    assert u.json()["notes"] == "hello"
    # Delete
    d = client.delete(f"{API}/vendors/{vid}")
    assert d.status_code == 200
    g2 = client.get(f"{API}/vendors/{vid}")
    assert g2.status_code == 404


def test_vendor_service_crud(client):
    # create vendor
    r = client.post(f"{API}/vendors", json={"name": "TEST_ServiceVendor", "status": "new"})
    vid = r.json()["id"]
    try:
        # add service
        svc_payload = {
            "name": "TEST_Service", "category": "venue", "price_type": "fixed",
            "unit_price": 500.0, "deposit": 100.0, "description": "x",
        }
        r2 = client.post(f"{API}/vendors/{vid}/services", json=svc_payload)
        assert r2.status_code == 200
        vendor = r2.json()
        assert len(vendor["services"]) == 1
        sid = vendor["services"][0]["id"]
        # update
        upd = {**svc_payload, "name": "TEST_Service_Updated", "unit_price": 600.0}
        r3 = client.put(f"{API}/vendors/{vid}/services/{sid}", json=upd)
        assert r3.status_code == 200
        upd_svc = next(s for s in r3.json()["services"] if s["id"] == sid)
        assert upd_svc["name"] == "TEST_Service_Updated"
        assert upd_svc["unit_price"] == 600.0
        # delete
        r4 = client.delete(f"{API}/vendors/{vid}/services/{sid}")
        assert r4.status_code == 200
        v_after = client.get(f"{API}/vendors/{vid}").json()
        assert all(s["id"] != sid for s in v_after["services"])
    finally:
        client.delete(f"{API}/vendors/{vid}")


# ---------- Selections (CRITICAL: total calculation) ----------
def _find_locanda(client):
    vs = client.get(f"{API}/vendors").json()
    return next(v for v in vs if v["name"] == "La Locanda del Nocciolo")


def _find_max(client):
    vs = client.get(f"{API}/vendors").json()
    return next(v for v in vs if v["name"] == "Max / Maximilliano — Photography")


def test_selection_per_guest_total(client):
    # Ensure guest_count = 50
    client.put(f"{API}/project", json={"guest_count": 50})
    locanda = _find_locanda(client)
    adult_pkg = next(s for s in locanda["services"] if s["price_type"] == "per_guest" and s["unit_price"] == 80.0)
    payload = {
        "category": "venue",
        "vendor_id": locanda["id"],
        "service_id": adult_pkg["id"],
        "quantity": 1,
        "priority": "must_have",
        "status": "selected",
    }
    r = client.post(f"{API}/selections", json=payload)
    assert r.status_code == 200, r.text
    sel = r.json()
    assert sel["total"] == 4000.0, f"Expected 4000 for per_guest EUR80 x 50 guests, got {sel['total']}"
    assert sel["vendor_name"] == "La Locanda del Nocciolo"
    assert sel["service_name"] == adult_pkg["name"]
    assert sel["unit_price"] == 80.0
    sid = sel["id"]

    # Update guest_count to 60 - recalculation happens on selection PUT
    client.put(f"{API}/project", json={"guest_count": 60})
    r2 = client.put(f"{API}/selections/{sid}", json={"quantity": 1, "status": "booked"})
    assert r2.status_code == 200
    assert r2.json()["total"] == 4800.0, f"After guest_count=60 total should be 4800, got {r2.json()['total']}"
    assert r2.json()["status"] == "booked"

    # cleanup: restore guest_count and delete
    client.put(f"{API}/project", json={"guest_count": 50})
    d = client.delete(f"{API}/selections/{sid}")
    assert d.status_code == 200


def test_selection_fixed_total(client):
    maxv = _find_max(client)
    main_pkg = next(s for s in maxv["services"] if s["price_type"] == "fixed" and s["unit_price"] == 1300.0)
    payload = {
        "category": "photography",
        "vendor_id": maxv["id"],
        "service_id": main_pkg["id"],
        "quantity": 1,
        "status": "considering",
    }
    r = client.post(f"{API}/selections", json=payload)
    assert r.status_code == 200
    sel = r.json()
    assert sel["total"] == 1300.0
    assert sel["deposit"] == 300.0
    assert sel["priority"] == "must_have"
    # Update priority
    up = client.put(f"{API}/selections/{sel['id']}", json={"priority": "nice_to_have", "quantity": 1})
    assert up.status_code == 200
    assert up.json()["priority"] == "nice_to_have"
    # Delete
    client.delete(f"{API}/selections/{sel['id']}")


# ---------- Tasks ----------
def test_tasks_seeded(client):
    r = client.get(f"{API}/tasks")
    assert r.status_code == 200
    tasks = r.json()
    assert len(tasks) >= 10
    for t in tasks:
        assert "_id" not in t


def test_task_crud(client):
    r = client.post(f"{API}/tasks", json={"title": "TEST_Task", "priority": "medium"})
    assert r.status_code == 200
    t = r.json()
    tid = t["id"]
    assert t["status"] == "todo"
    # in_progress
    r2 = client.put(f"{API}/tasks/{tid}", json={"status": "in_progress"})
    assert r2.status_code == 200 and r2.json()["status"] == "in_progress"
    # done
    r3 = client.put(f"{API}/tasks/{tid}", json={"status": "done"})
    assert r3.status_code == 200 and r3.json()["status"] == "done"
    # delete
    d = client.delete(f"{API}/tasks/{tid}")
    assert d.status_code == 200


# ---------- Dashboard ----------
def test_dashboard(client):
    r = client.get(f"{API}/dashboard")
    assert r.status_code == 200
    d = r.json()
    assert "project" in d and "stats" in d
    s = d["stats"]
    for k in [
        "total_selected", "total_considering", "total_deposits", "remaining",
        "booked", "selected", "considering", "vendors_selected",
        "vendors_shortlisted", "days_to_wedding",
    ]:
        assert k in s, f"missing stat key: {k}"
    assert "by_category" in d and isinstance(d["by_category"], list)
    assert "next_tasks" in d and isinstance(d["next_tasks"], list)


# ---------- Seed reset ----------
def test_seed_reset_preserves_counts(client):
    # With reset=true, vendors should be wiped and reseeded to exactly 6
    r = client.post(f"{API}/seed", params={"reset": "true"})
    assert r.status_code == 200
    vendors = client.get(f"{API}/vendors").json()
    assert len(vendors) == 6, f"After reset, expected 6 vendors, got {len(vendors)}"
    tasks = client.get(f"{API}/tasks").json()
    assert len(tasks) == 10
