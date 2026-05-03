from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, date

from seed_data import SEED_VENDORS, SEED_TASKS, DREAM_CATEGORIES, DREAM_GOALS, DEFAULT_PROJECT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logger = logging.getLogger("wedding")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# In-memory flag so we only attempt category-seeding once per process.
_categories_seeded = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    try:
        vendors_count = await db.vendors.count_documents({})
        project_doc = await db.project.find_one({"id": "singleton"})
        if vendors_count == 0 and not project_doc:
            logger.info("First boot — seeding database…")
            try:
                await _run_seed(reset=False)
            except Exception as e:
                logger.error(f"Seed failed: {e}")
        else:
            logger.info(f"Boot: {vendors_count} vendors in DB")
    except Exception as e:
        logger.error(f"Startup check failed (non-fatal): {e}")

    yield

    # --- Shutdown ---
    try:
        client.close()
    except Exception:
        pass


app = FastAPI(title="Cimbri Wedding Planner", lifespan=lifespan)
api_router = APIRouter(prefix="/api")


# ============================
# MODELS
# ============================
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: "singleton")
    couple_names: str = "Veronica & Partner"
    wedding_date: Optional[str] = None  # ISO date string
    location: str = "Cuneo, Italy"
    guest_count: int = 50
    target_budget: float = 15000.0
    style_notes: str = ""
    updated_at: str = Field(default_factory=now_iso)


class ProjectUpdate(BaseModel):
    couple_names: Optional[str] = None
    wedding_date: Optional[str] = None
    location: Optional[str] = None
    guest_count: Optional[int] = None
    target_budget: Optional[float] = None
    style_notes: Optional[str] = None


class VendorService(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # maps to DreamCategory id
    dream_goal: Optional[str] = None  # dream goal id
    description: str = ""
    price_type: Literal["fixed", "per_guest", "per_hour", "per_unit", "custom"] = "fixed"
    unit_price: float = 0.0
    deposit: float = 0.0
    notes: str = ""
    active: bool = True


class VendorServiceCreate(BaseModel):
    name: str
    category: str
    dream_goal: Optional[str] = None
    description: str = ""
    price_type: Literal["fixed", "per_guest", "per_hour", "per_unit", "custom"] = "fixed"
    unit_price: float = 0.0
    deposit: float = 0.0
    notes: str = ""
    active: bool = True


class Vendor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    categories: List[str] = []
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    instagram: str = ""
    location: str = ""
    notes: str = ""
    status: Literal["new", "contacted", "shortlisted", "selected", "rejected"] = "new"
    services: List[VendorService] = []
    created_at: str = Field(default_factory=now_iso)


class VendorCreate(BaseModel):
    name: str
    categories: List[str] = []
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    instagram: str = ""
    location: str = ""
    notes: str = ""
    status: Literal["new", "contacted", "shortlisted", "selected", "rejected"] = "new"


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    categories: Optional[List[str]] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[Literal["new", "contacted", "shortlisted", "selected", "rejected"]] = None


class Selection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    dream_goal: Optional[str] = None
    vendor_id: str
    vendor_name: str
    service_id: str
    service_name: str
    price_type: str
    unit_price: float
    deposit: float
    quantity: float = 1
    total: float = 0.0
    priority: Literal["must_have", "nice_to_have", "optional"] = "must_have"
    status: Literal["considering", "selected", "booked"] = "considering"
    notes: str = ""
    created_at: str = Field(default_factory=now_iso)


class SelectionCreate(BaseModel):
    category: str
    dream_goal: Optional[str] = None
    vendor_id: str
    service_id: str
    quantity: float = 1
    priority: Literal["must_have", "nice_to_have", "optional"] = "must_have"
    status: Literal["considering", "selected", "booked"] = "considering"
    notes: str = ""


class SelectionUpdate(BaseModel):
    quantity: Optional[float] = None
    priority: Optional[Literal["must_have", "nice_to_have", "optional"]] = None
    status: Optional[Literal["considering", "selected", "booked"]] = None
    notes: Optional[str] = None


class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: Optional[str] = None
    vendor_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Literal["low", "medium", "high"] = "medium"
    status: Literal["todo", "in_progress", "done"] = "todo"
    notes: str = ""
    created_at: str = Field(default_factory=now_iso)


class TaskCreate(BaseModel):
    title: str
    category: Optional[str] = None
    vendor_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Literal["low", "medium", "high"] = "medium"
    status: Literal["todo", "in_progress", "done"] = "todo"
    notes: str = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    vendor_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    status: Optional[Literal["todo", "in_progress", "done"]] = None
    notes: Optional[str] = None


# ============================
# HELPERS
# ============================
def compute_total(price_type: str, unit_price: float, quantity: float, guest_count: int) -> float:
    if price_type == "per_guest":
        return round(unit_price * guest_count * quantity, 2)
    return round(unit_price * quantity, 2)


async def get_project_doc() -> dict:
    doc = await db.project.find_one({"id": "singleton"}, {"_id": 0})
    if not doc:
        p = Project(**DEFAULT_PROJECT)
        await db.project.insert_one(p.model_dump())
        return p.model_dump()
    return doc


# ============================
# ROUTES
# ============================
@api_router.get("/")
async def root():
    return {"message": "Cimbri Wedding Planner API", "status": "ok"}


@api_router.post("/")
async def root_post():
    # Some probes/scanners use POST; respond 200 to avoid false-unhealthy signals.
    return {"status": "ok"}


@api_router.get("/health")
async def health():
    # Fast health check — no DB hit, safe for readiness probes.
    return {"status": "ok"}


# ---- Project ----
@api_router.get("/project", response_model=Project)
async def get_project():
    doc = await get_project_doc()
    return Project(**doc)


@api_router.put("/project", response_model=Project)
async def update_project(update: ProjectUpdate):
    doc = await get_project_doc()
    patch = {k: v for k, v in update.model_dump().items() if v is not None}
    patch["updated_at"] = now_iso()
    doc.update(patch)
    await db.project.update_one({"id": "singleton"}, {"$set": doc}, upsert=True)
    return Project(**doc)


# ---- Categories & Goals ----
class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    color: Literal["sage", "rose", "gold"] = "sage"


async def _seed_categories_if_missing():
    """Seed the canonical DREAM_CATEGORIES into DB, preserving their ids.

    Runs at most once per process thanks to the `_categories_seeded` flag —
    critical for performance because GET /dream-categories is called often.
    """
    global _categories_seeded
    if _categories_seeded:
        return
    try:
        for c in DREAM_CATEGORIES:
            exists = await db.categories.find_one({"id": c["id"]}, {"_id": 0})
            if not exists:
                await db.categories.insert_one({**c, "custom": False})
        _categories_seeded = True
    except Exception as e:
        logger.warning(f"Category seed skipped: {e}")


@api_router.get("/dream-categories")
async def get_categories():
    await _seed_categories_if_missing()
    cats = await db.categories.find({}, {"_id": 0}).to_list(100)
    # Keep canonical ones first in their defined order, then custom ones alphabetically
    canonical_order = {c["id"]: i for i, c in enumerate(DREAM_CATEGORIES)}
    cats.sort(key=lambda c: (
        0 if c["id"] in canonical_order else 1,
        canonical_order.get(c["id"], 9999),
        c.get("name", "").lower(),
    ))
    return cats


@api_router.post("/dream-categories")
async def create_category(payload: CategoryCreate):
    import re
    base_id = re.sub(r"[^a-z0-9]+", "_", payload.name.lower()).strip("_")[:40] or str(uuid.uuid4())[:8]
    cid = base_id
    i = 1
    while await db.categories.find_one({"id": cid}):
        cid = f"{base_id}_{i}"
        i += 1
    doc = {
        "id": cid,
        "name": payload.name,
        "description": payload.description,
        "color": payload.color,
        "custom": True,
    }
    await db.categories.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.delete("/dream-categories/{cat_id}")
async def delete_category(cat_id: str):
    cat = await db.categories.find_one({"id": cat_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Category not found")
    if not cat.get("custom"):
        raise HTTPException(400, "Built-in categories cannot be removed.")
    # Block if in use
    in_use_vendor = await db.vendors.find_one({"categories": cat_id})
    in_use_sel = await db.selections.find_one({"category": cat_id})
    if in_use_vendor or in_use_sel:
        raise HTTPException(400, "This category is still used by a vendor or selection.")
    await db.categories.delete_one({"id": cat_id})
    return {"ok": True}


@api_router.get("/dream-goals")
async def get_goals():
    await _seed_goals_if_missing()
    goals = await db.goals.find({}, {"_id": 0}).to_list(200)
    canonical_order = {g["id"]: i for i, g in enumerate(DREAM_GOALS)}
    goals.sort(key=lambda g: (
        0 if g["id"] in canonical_order else 1,
        canonical_order.get(g["id"], 9999),
        g.get("name", "").lower(),
    ))
    return goals


class GoalCreate(BaseModel):
    name: str
    category: str
    description: str = ""


_goals_seeded = False


async def _seed_goals_if_missing():
    """Seed canonical DREAM_GOALS into DB once per process."""
    global _goals_seeded
    if _goals_seeded:
        return
    try:
        for g in DREAM_GOALS:
            exists = await db.goals.find_one({"id": g["id"]}, {"_id": 0})
            if not exists:
                await db.goals.insert_one({**g, "custom": False})
        _goals_seeded = True
    except Exception as e:
        logger.warning(f"Goal seed skipped: {e}")


@api_router.post("/dream-goals")
async def create_goal(payload: GoalCreate):
    import re
    base_id = re.sub(r"[^a-z0-9]+", "_", payload.name.lower()).strip("_")[:40] or str(uuid.uuid4())[:8]
    gid = base_id
    i = 1
    while await db.goals.find_one({"id": gid}):
        gid = f"{base_id}_{i}"
        i += 1
    doc = {
        "id": gid,
        "name": payload.name,
        "category": payload.category,
        "description": payload.description,
        "custom": True,
    }
    await db.goals.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.delete("/dream-goals/{goal_id}")
async def delete_goal(goal_id: str):
    g = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not g:
        raise HTTPException(404, "Dream goal not found")
    if not g.get("custom"):
        raise HTTPException(400, "Built-in dream goals cannot be removed.")
    in_use_sel = await db.selections.find_one({"dream_goal": goal_id})
    in_use_svc = await db.vendors.find_one({"services.dream_goal": goal_id})
    if in_use_sel or in_use_svc:
        raise HTTPException(400, "This dream goal is still linked to a selection or service.")
    await db.goals.delete_one({"id": goal_id})
    return {"ok": True}


# ---- Vendors ----
@api_router.get("/vendors", response_model=List[Vendor])
async def list_vendors():
    vendors = await db.vendors.find({}, {"_id": 0}).to_list(1000)
    return [Vendor(**v) for v in vendors]


@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str):
    v = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not v:
        raise HTTPException(404, "Vendor not found")
    return Vendor(**v)


@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(payload: VendorCreate):
    v = Vendor(**payload.model_dump())
    await db.vendors.insert_one(v.model_dump())
    return v


@api_router.put("/vendors/{vendor_id}", response_model=Vendor)
async def update_vendor(vendor_id: str, payload: VendorUpdate):
    existing = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Vendor not found")
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    existing.update(patch)
    await db.vendors.update_one({"id": vendor_id}, {"$set": existing})
    return Vendor(**existing)


@api_router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str):
    await db.vendors.delete_one({"id": vendor_id})
    # Also remove selections tied to this vendor
    await db.selections.delete_many({"vendor_id": vendor_id})
    return {"ok": True}


# ---- Vendor services ----
@api_router.post("/vendors/{vendor_id}/services", response_model=Vendor)
async def add_service(vendor_id: str, payload: VendorServiceCreate):
    existing = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Vendor not found")
    svc = VendorService(**payload.model_dump())
    existing.setdefault("services", []).append(svc.model_dump())
    await db.vendors.update_one({"id": vendor_id}, {"$set": {"services": existing["services"]}})
    return Vendor(**existing)


@api_router.put("/vendors/{vendor_id}/services/{service_id}", response_model=Vendor)
async def update_service(vendor_id: str, service_id: str, payload: VendorServiceCreate):
    existing = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Vendor not found")
    services = existing.get("services", [])
    updated = False
    for s in services:
        if s["id"] == service_id:
            s.update(payload.model_dump())
            updated = True
    if not updated:
        raise HTTPException(404, "Service not found")
    await db.vendors.update_one({"id": vendor_id}, {"$set": {"services": services}})
    return Vendor(**existing)


@api_router.delete("/vendors/{vendor_id}/services/{service_id}")
async def delete_service(vendor_id: str, service_id: str):
    existing = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Vendor not found")
    services = [s for s in existing.get("services", []) if s["id"] != service_id]
    await db.vendors.update_one({"id": vendor_id}, {"$set": {"services": services}})
    await db.selections.delete_many({"service_id": service_id})
    return {"ok": True}


# ---- Selections ----
@api_router.get("/selections", response_model=List[Selection])
async def list_selections():
    sels = await db.selections.find({}, {"_id": 0}).to_list(1000)
    return [Selection(**s) for s in sels]


@api_router.post("/selections", response_model=Selection)
async def create_selection(payload: SelectionCreate):
    vendor = await db.vendors.find_one({"id": payload.vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(404, "Vendor not found")
    svc = next((s for s in vendor.get("services", []) if s["id"] == payload.service_id), None)
    if not svc:
        raise HTTPException(404, "Service not found")
    project = await get_project_doc()
    total = compute_total(svc["price_type"], svc["unit_price"], payload.quantity, project.get("guest_count", 50))
    sel = Selection(
        category=payload.category,
        dream_goal=payload.dream_goal,
        vendor_id=vendor["id"],
        vendor_name=vendor["name"],
        service_id=svc["id"],
        service_name=svc["name"],
        price_type=svc["price_type"],
        unit_price=svc["unit_price"],
        deposit=svc["deposit"],
        quantity=payload.quantity,
        total=total,
        priority=payload.priority,
        status=payload.status,
        notes=payload.notes,
    )
    await db.selections.insert_one(sel.model_dump())
    return sel


@api_router.put("/selections/{selection_id}", response_model=Selection)
async def update_selection(selection_id: str, payload: SelectionUpdate):
    existing = await db.selections.find_one({"id": selection_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Selection not found")
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    existing.update(patch)
    project = await get_project_doc()
    existing["total"] = compute_total(
        existing["price_type"], existing["unit_price"],
        existing.get("quantity", 1), project.get("guest_count", 50)
    )
    await db.selections.update_one({"id": selection_id}, {"$set": existing})
    return Selection(**existing)


@api_router.delete("/selections/{selection_id}")
async def delete_selection(selection_id: str):
    await db.selections.delete_one({"id": selection_id})
    return {"ok": True}


# ---- Tasks ----
@api_router.get("/tasks", response_model=List[Task])
async def list_tasks():
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return [Task(**t) for t in tasks]


@api_router.post("/tasks", response_model=Task)
async def create_task(payload: TaskCreate):
    t = Task(**payload.model_dump())
    await db.tasks.insert_one(t.model_dump())
    return t


@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, payload: TaskUpdate):
    existing = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Task not found")
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    existing.update(patch)
    await db.tasks.update_one({"id": task_id}, {"$set": existing})
    return Task(**existing)


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    await db.tasks.delete_one({"id": task_id})
    return {"ok": True}


# ---- Dashboard ----
@api_router.get("/dashboard")
async def dashboard():
    project = await get_project_doc()
    # Bounded fetches — plenty of headroom for a personal wedding planner,
    # keeps the endpoint fast on Atlas.
    sels = await db.selections.find({}, {"_id": 0}).to_list(500)
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(500)
    vendors = await db.vendors.find({}, {"_id": 0, "status": 1, "id": 1}).to_list(500)

    total_selected = sum(s.get("total", 0) for s in sels if s.get("status") in ("selected", "booked"))
    total_considering = sum(s.get("total", 0) for s in sels if s.get("status") == "considering")
    total_deposits = sum(
        s.get("deposit", 0) for s in sels if s.get("status") in ("selected", "booked")
    )
    remaining = max(0.0, (project.get("target_budget") or 0) - total_selected)

    booked = sum(1 for s in sels if s.get("status") == "booked")
    selected = sum(1 for s in sels if s.get("status") == "selected")
    considering = sum(1 for s in sels if s.get("status") == "considering")

    tasks_todo = sum(1 for t in tasks if t.get("status") == "todo")
    tasks_progress = sum(1 for t in tasks if t.get("status") == "in_progress")
    tasks_done = sum(1 for t in tasks if t.get("status") == "done")

    vendors_selected = sum(1 for v in vendors if v.get("status") == "selected")
    vendors_shortlisted = sum(1 for v in vendors if v.get("status") == "shortlisted")

    # Next tasks
    upcoming = [t for t in tasks if t.get("status") != "done"]
    upcoming.sort(key=lambda t: (t.get("due_date") or "9999-12-31", t.get("priority") or "z"))
    next_tasks = upcoming[:5]

    # By category
    by_cat = {}
    for s in sels:
        c = s.get("category", "other")
        by_cat.setdefault(c, {"category": c, "total": 0.0, "count": 0, "items": []})
        if s.get("status") in ("selected", "booked"):
            by_cat[c]["total"] += s.get("total", 0)
        by_cat[c]["count"] += 1
        by_cat[c]["items"].append(s)

    days_to_wedding = None
    if project.get("wedding_date"):
        try:
            wd = datetime.fromisoformat(project["wedding_date"]).date()
            delta = (wd - date.today()).days
            days_to_wedding = delta
        except Exception:
            days_to_wedding = None

    return {
        "project": project,
        "stats": {
            "total_selected": round(total_selected, 2),
            "total_considering": round(total_considering, 2),
            "total_deposits": round(total_deposits, 2),
            "remaining": round(remaining, 2),
            "booked": booked,
            "selected": selected,
            "considering": considering,
            "tasks_todo": tasks_todo,
            "tasks_progress": tasks_progress,
            "tasks_done": tasks_done,
            "vendors_selected": vendors_selected,
            "vendors_shortlisted": vendors_shortlisted,
            "days_to_wedding": days_to_wedding,
        },
        "next_tasks": next_tasks,
        "by_category": list(by_cat.values()),
    }


# ---- Seed ----
async def _run_seed(reset: bool = False):
    global _categories_seeded, _goals_seeded
    if reset:
        await db.vendors.delete_many({})
        await db.tasks.delete_many({})
        await db.selections.delete_many({})
        await db.project.delete_many({})
        await db.categories.delete_many({})
        await db.goals.delete_many({})
        _categories_seeded = False
        _goals_seeded = False

    # Seed project if missing
    existing_project = await db.project.find_one({"id": "singleton"})
    if not existing_project:
        await db.project.insert_one(Project(**DEFAULT_PROJECT).model_dump())

    # Seed categories & goals
    await _seed_categories_if_missing()
    await _seed_goals_if_missing()

    # Seed vendors if empty
    vendors_count = await db.vendors.count_documents({})
    if vendors_count == 0:
        for v in SEED_VENDORS:
            services = [VendorService(**s).model_dump() for s in v.get("services", [])]
            doc = {**v, "services": services, "id": v.get("id", str(uuid.uuid4())),
                   "created_at": now_iso()}
            doc.setdefault("status", "shortlisted")
            doc.setdefault("categories", [])
            await db.vendors.insert_one(Vendor(**doc).model_dump())

    # Seed tasks if empty
    tasks_count = await db.tasks.count_documents({})
    if tasks_count == 0:
        for t in SEED_TASKS:
            await db.tasks.insert_one(Task(**t).model_dump())

    return {"ok": True, "seeded": True}


@api_router.post("/seed")
async def seed_data_endpoint(reset: bool = False):
    return await _run_seed(reset=reset)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
