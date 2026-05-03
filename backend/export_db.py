"""Export the current MongoDB state into Python literals for seed_data.py.
Run once locally — output is a ready-to-paste Python file.
"""
import asyncio
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")


def _pyrepr(value, indent=0):
    """Render a Python value with clean formatting."""
    pad = "    " * indent
    npad = "    " * (indent + 1)
    if isinstance(value, dict):
        if not value:
            return "{}"
        parts = []
        for k, v in value.items():
            parts.append(f"{npad}{json.dumps(k)}: {_pyrepr(v, indent + 1)}")
        return "{\n" + ",\n".join(parts) + f",\n{pad}}}"
    if isinstance(value, list):
        if not value:
            return "[]"
        parts = []
        for v in value:
            parts.append(f"{npad}{_pyrepr(v, indent + 1)}")
        return "[\n" + ",\n".join(parts) + f",\n{pad}]"
    if value is None:
        return "None"
    if isinstance(value, bool):
        return "True" if value else "False"
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    return json.dumps(value, ensure_ascii=False)


async def export():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    vendors = await db.vendors.find({}, {"_id": 0}).to_list(1000)
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    selections = await db.selections.find({}, {"_id": 0}).to_list(1000)
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    goals = await db.goals.find({}, {"_id": 0}).to_list(1000)
    project = await db.project.find_one({"id": "singleton"}, {"_id": 0}) or {}

    # Keep canonical category order
    CANONICAL_CAT_ORDER = [
        "venue", "photography", "video", "florals", "music_ceremony", "music_aperitif",
        "music_dinner", "music_dj", "live_art", "cake", "guest_corners", "comfort",
        "stationery", "accommodation", "transport", "other",
    ]
    categories.sort(key=lambda c: (
        CANONICAL_CAT_ORDER.index(c["id"]) if c["id"] in CANONICAL_CAT_ORDER else 999,
        c.get("name", "").lower(),
    ))

    CANONICAL_GOAL_ORDER = [
        "entrance_flowers", "civil_arch", "dinner_lighting", "table_decor", "cake_corner",
        "chocolate_fountain", "photo_corner", "photobooth", "turkish_corner", "ireland_corner",
        "guest_basket", "ceremony_water_rice", "ceremony_live_music", "aperitif_live_music",
        "dj_after_cake", "live_sketching", "photo_main", "video_main", "wedding_menu",
        "guest_rooms", "invitation_suite",
    ]
    goals.sort(key=lambda g: (
        CANONICAL_GOAL_ORDER.index(g["id"]) if g["id"] in CANONICAL_GOAL_ORDER else 999,
        g.get("name", "").lower(),
    ))

    # Compose the Python file
    parts = [
        '"""Seed data for Cimbri Wedding Planner — exported from MongoDB.',
        'Single source of truth for fresh deployments.',
        '',
        'Update this file by running: python export_db.py',
        '"""',
        'import uuid',
        'from datetime import datetime, timezone, timedelta',
        '',
        '',
        'def _sid():',
        '    return str(uuid.uuid4())',
        '',
        '',
        '# ────────────────────────────────────────────',
        '# PROJECT (singleton)',
        '# ────────────────────────────────────────────',
        f'DEFAULT_PROJECT = {_pyrepr(project)}',
        '',
        '# ────────────────────────────────────────────',
        '# DREAM CATEGORIES',
        '# ────────────────────────────────────────────',
        f'DREAM_CATEGORIES = {_pyrepr(categories)}',
        '',
        '# ────────────────────────────────────────────',
        '# DREAM GOALS',
        '# ────────────────────────────────────────────',
        f'DREAM_GOALS = {_pyrepr(goals)}',
        '',
        '# ────────────────────────────────────────────',
        '# VENDORS (with embedded services)',
        '# ────────────────────────────────────────────',
        f'SEED_VENDORS = {_pyrepr(vendors)}',
        '',
        '# ────────────────────────────────────────────',
        '# SELECTIONS (the actual plan picks)',
        '# ────────────────────────────────────────────',
        f'SEED_SELECTIONS = {_pyrepr(selections)}',
        '',
        '# ────────────────────────────────────────────',
        '# TASKS',
        '# ────────────────────────────────────────────',
        f'SEED_TASKS = {_pyrepr(tasks)}',
        '',
    ]

    out = "\n".join(parts)
    target = Path(__file__).parent / "seed_data.py"
    target.write_text(out, encoding="utf-8")
    print(f"✓ Wrote {len(vendors)} vendors, {len(tasks)} tasks, {len(selections)} selections, "
          f"{len(categories)} categories, {len(goals)} goals, 1 project")
    print(f"✓ Output: {target}")
    client.close()


if __name__ == "__main__":
    asyncio.run(export())
