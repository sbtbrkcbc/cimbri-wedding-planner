"""Seed data for Veronica's Dream Wedding planner.
All values and notes come from Veronica's planning document.
"""
import uuid
from datetime import datetime, timezone, timedelta


def _iso(d):
    return d.isoformat()


def _sid():
    return str(uuid.uuid4())


DEFAULT_PROJECT = {
    "id": "singleton",
    "couple_names": "The Cimbri Wedding",
    "wedding_date": None,
    "location": "Cuneo, Piedmont — Italy",
    "guest_count": 50,
    "target_budget": 15000.0,
    "style_notes": "Soft, elegant, and warm. Sage green, dusty rose, candles, florals, lanterns. An Italian farmhouse celebration with a Turkish corner and a touch of Ireland.",
    "updated_at": datetime.now(timezone.utc).isoformat(),
}


# Dream categories — big buckets the couple organises planning around
DREAM_CATEGORIES = [
    {"id": "venue", "name": "Venue & Catering", "description": "The heart of the day — where you eat, dance, and celebrate.", "color": "sage"},
    {"id": "photography", "name": "Photography", "description": "Still memories from every hour of your day.", "color": "rose"},
    {"id": "video", "name": "Video", "description": "Movement, vows, laughter — saved forever.", "color": "gold"},
    {"id": "florals", "name": "Florals & Decor", "description": "Arches, bouquets, table blooms and ribbons.", "color": "rose"},
    {"id": "music_ceremony", "name": "Ceremony Music", "description": "Live music for the civil rite moment.", "color": "sage"},
    {"id": "music_aperitif", "name": "Aperitif Music", "description": "A warm, acoustic welcome during drinks.", "color": "sage"},
    {"id": "music_dinner", "name": "Dinner Music", "description": "Soft background presence during the meal.", "color": "sage"},
    {"id": "music_dj", "name": "DJ & Dancing", "description": "After cake cutting — lights on the dance floor.", "color": "gold"},
    {"id": "live_art", "name": "Live Art & Sketching", "description": "Watercolor memories made on the spot.", "color": "rose"},
    {"id": "cake", "name": "Cake & Sweets", "description": "The cake table, chocolate fountain and desserts.", "color": "rose"},
    {"id": "guest_corners", "name": "Guest Corners", "description": "Photo corner, guestbook, photobooth, Turkish & Ireland corners.", "color": "gold"},
    {"id": "comfort", "name": "Guest Comfort", "description": "Fans, mosquito spray, sunscreen, water, rice, little kindnesses.", "color": "sage"},
    {"id": "stationery", "name": "Stationery", "description": "Invitations, seating chart, menus, place cards, welcome sign.", "color": "rose"},
    {"id": "accommodation", "name": "Accommodation", "description": "Guest rooms at the venue and nearby stays.", "color": "sage"},
    {"id": "transport", "name": "Transportation", "description": "Getting the couple and guests where they need to be.", "color": "gold"},
    {"id": "other", "name": "Other", "description": "Everything else that makes the day yours.", "color": "gold"},
]


# Dream goals — emotional/visual intentions pulled straight from Veronica's list
DREAM_GOALS = [
    {"id": "entrance_flowers", "name": "Entrance with flowers & ribbons", "category": "florals", "description": "A beautiful arrival feeling for guests — staircase styled with flowers and colored ribbons."},
    {"id": "civil_arch", "name": "Decorated civil rite arch", "category": "florals", "description": "A floral arch for the ceremony — or styling the venue's existing wooden structure."},
    {"id": "dinner_lighting", "name": "Dinner lighting magic", "category": "florals", "description": "Many lights in the dining area for a romantic, glowing atmosphere."},
    {"id": "table_decor", "name": "Candles, fabrics & florals on tables", "category": "florals", "description": "Layered table compositions — candles, soft fabrics, and small blooms."},
    {"id": "cake_corner", "name": "Cake-cutting table", "category": "cake", "description": "Decorated cake-cutting area with lanterns and star-like light effects."},
    {"id": "chocolate_fountain", "name": "Chocolate fountain", "category": "cake", "description": "A crowd-pleaser sweets moment."},
    {"id": "photo_corner", "name": "Photo corner & guestbook", "category": "guest_corners", "description": "Guests take pictures, paste them in a little album, write dedications."},
    {"id": "photobooth", "name": "Photobooth with props", "category": "guest_corners", "description": "Gadgets, frames, playful props — a fun dedicated photo spot."},
    {"id": "turkish_corner", "name": "Turkish corner", "category": "guest_corners", "description": "A small table/area with Turkish-themed items to honour Veronica's side."},
    {"id": "ireland_corner", "name": "Ireland corner", "category": "guest_corners", "description": "A small Irish-themed nod for the family's Irish side."},
    {"id": "guest_basket", "name": "Guest comfort basket", "category": "comfort", "description": "Mosquito spray, fans, sunscreen, napkins, little kindnesses."},
    {"id": "ceremony_water_rice", "name": "Ceremony water & rice", "category": "comfort", "description": "Bottled water for guests and rice to throw after the civil rite."},
    {"id": "ceremony_live_music", "name": "Live music for the ceremony", "category": "music_ceremony", "description": "A real instrument or voice during the civil rite — subtle, moving."},
    {"id": "aperitif_live_music", "name": "Live music for the aperitif", "category": "music_aperitif", "description": "Acoustic trio or duo while guests arrive and mingle."},
    {"id": "dj_after_cake", "name": "DJ after cake cutting", "category": "music_dj", "description": "Cake first, then the dance floor opens."},
    {"id": "live_sketching", "name": "Live sketching artist", "category": "live_art", "description": "Watercolor portraits of guests — a lovely keepsake."},
    {"id": "photo_main", "name": "Full-day photography", "category": "photography", "description": "Preparations through the final celebration."},
    {"id": "video_main", "name": "Wedding video", "category": "video", "description": "~18 min film with vows, preparations, and party moments."},
    {"id": "wedding_menu", "name": "The wedding meal", "category": "venue", "description": "Aperitif + 3-course menu, local Piedmontese kitchen."},
    {"id": "guest_rooms", "name": "Guest rooms at the venue", "category": "accommodation", "description": "On-site rooms so guests can celebrate freely."},
    {"id": "invitation_suite", "name": "Invitation suite", "category": "stationery", "description": "Invitations, menus, seating chart and welcome sign."},
]


def _s(name, category, price_type, unit_price, deposit=0.0, description="", notes="", dream_goal=None):
    return {
        "id": _sid(),
        "name": name,
        "category": category,
        "dream_goal": dream_goal,
        "description": description,
        "price_type": price_type,
        "unit_price": unit_price,
        "deposit": deposit,
        "notes": notes,
        "active": True,
    }


SEED_VENDORS = [
    {
        "id": "vendor-locanda-nocciolo",
        "name": "La Locanda del Nocciolo",
        "categories": ["venue", "accommodation", "cake"],
        "contact_person": "Danila Rossi",
        "phone": "+39 338 894 9541",
        "email": "",
        "website": "",
        "instagram": "",
        "location": "Località Chiarene 4, Novello (CN)",
        "notes": "Main contact: Danila Rossi. 9 guest rooms + 10th free for the couple. Gift: 1 overnight stay with breakfast for the couple. Party until 02:00; after midnight €150/hour. Final guest count 2 weeks before. No fireworks; colored fountains/lights possible. Outside wine not allowed.",
        "status": "selected",
        "services": [
            _s("Wedding package — adult", "venue", "per_guest", 80.0, 0.0,
               "Aperitif + lunch/dinner: 3 appetizers, 2 first-course tastings, sorbet, 1 main course, 2 sides. 1 bottle of wine per 4 guests (Arneis/Chardonnay, Dolcetto/Barbera).",
               "Nebbiolo/Barolo/Barbaresco are extra.", dream_goal="wedding_menu"),
            _s("Child menu (5–10 yrs)", "venue", "per_guest", 20.0, 0.0,
               "Prosciutto, penne or ravioli, Milanese with fries or hamburger.", ""),
            _s("Child menu (1–5 yrs) — à la carte", "venue", "custom", 0.0, 0.0,
               "Ordered from the menu on the day.", ""),
            _s("Wedding cake — from venue (per portion)", "venue", "per_guest", 5.0, 0.0,
               "Cake made by the venue.", "", dream_goal="cake_corner"),
            _s("Outside cake — slicing fee (per portion)", "venue", "per_guest", 3.0, 0.0,
               "Certified lab/workshop cake required; invoice/certification needed.", "", dream_goal="cake_corner"),
            _s("Chocolate fountain", "cake", "fixed", 200.0, 0.0,
               "A sweet, memorable station.", "", dream_goal="chocolate_fountain"),
            _s("Bartender", "venue", "fixed", 200.0, 0.0, "On-site bartender for cocktails.", ""),
            _s("Water (per bottle)", "venue", "per_unit", 2.0, 0.0, "", ""),
            _s("Spritz carafe", "venue", "per_unit", 20.0, 0.0, "", ""),
            _s("Late hour after midnight (per hour)", "venue", "per_hour", 150.0, 0.0,
               "Party must finish by 02:00.", ""),
            _s("Guest room (double/triple)", "accommodation", "per_unit", 120.0, 0.0,
               "9 rooms for guests; 10th complimentary for the couple.", "", dream_goal="guest_rooms"),
            _s("Simple table decoration & ribbons", "venue", "per_guest", 0.0, 0.0,
               "Handwritten note: GRATUITO (appears to be offered free).", ""),
        ],
    },
    {
        "id": "vendor-symon-mattio",
        "name": "Symon Mattio — Flower by Sym",
        "categories": ["florals"],
        "contact_person": "Symon Mattio",
        "phone": "+39 392 805 0230",
        "email": "symonmio@gmail.com",
        "website": "",
        "instagram": "flower_by_sym",
        "location": "Cuneo area",
        "notes": "Floral designer — events, weddings, window decoration.",
        "status": "shortlisted",
        "services": [
            _s("Entrance & staircase florals", "florals", "custom", 0.0, 0.0,
               "Entrance styled with flowers and coloured ribbons.", "Price on request.",
               dream_goal="entrance_flowers"),
            _s("Civil rite floral arch", "florals", "custom", 0.0, 0.0,
               "Arch or styling the venue's wooden structure.", "Price on request.",
               dream_goal="civil_arch"),
            _s("Table centerpieces (per table)", "florals", "per_unit", 0.0, 0.0,
               "Candles, fabrics and small blooms per table.", "Price on request.",
               dream_goal="table_decor"),
            _s("Cake-cutting area styling", "florals", "custom", 0.0, 0.0,
               "Lanterns and floral accents for the cake moment.", "", dream_goal="cake_corner"),
        ],
    },
    {
        "id": "vendor-davide-tolis",
        "name": "Davide Giuseppe Tolis — Il fotografo di matrimoni",
        "categories": ["photography"],
        "contact_person": "Davide Giuseppe Tolis",
        "phone": "+39 347 374 4553",
        "email": "info@davidegiuseppetolis.it",
        "website": "davidegiuseppetolis.it",
        "instagram": "",
        "location": "Corso Italia 35/a, 12037 Saluzzo (CN)",
        "notes": "Wedding photographer.",
        "status": "shortlisted",
        "services": [
            _s("Wedding photography — enquiry", "photography", "custom", 0.0, 0.0,
               "Full-day photography — request quote.", "Awaiting quote.",
               dream_goal="photo_main"),
        ],
    },
    {
        "id": "vendor-max-maxi",
        "name": "Max / Maximilliano — Photography",
        "categories": ["photography", "video"],
        "contact_person": "Max / Maximilliano",
        "phone": "",
        "email": "",
        "website": "",
        "instagram": "",
        "location": "",
        "notes": "Main package: transport included; 12 hours; 1 photographer; 1-hour prematrimonio; album included. Booking deposit €300 to block the date.",
        "status": "shortlisted",
        "services": [
            _s("Main photo package (12h + album + prematrimonio)", "photography", "fixed", 1300.0, 300.0,
               "Transport, 12 hours, 1 photographer, album, 1h pre-wedding.",
               "€300 deposit blocks the date.", dream_goal="photo_main"),
            _s("Second photographer add-on", "photography", "fixed", 250.0, 0.0,
               "Extra photographer for double coverage.", ""),
            _s("Wedding video (~18 min)", "video", "fixed", 1000.0, 0.0,
               "Audio, vows, preparations and party footage.", "", dream_goal="video_main"),
        ],
    },
    {
        "id": "vendor-sonia-ricci",
        "name": "Sonia Ricci — Live Sketching",
        "categories": ["live_art", "stationery"],
        "contact_person": "Sonia Ricci",
        "phone": "+39 349 587 9193",
        "email": "",
        "website": "",
        "instagram": "",
        "location": "",
        "notes": "Live sketching can double as entertainment and a keepsake. Styles: contemporary fashion sketch or romantic watercolor. Can finish portraits later in studio. Also does full stationery suite. Free no-obligation sample sketch on request.",
        "status": "shortlisted",
        "services": [
            _s("Live sketching — base (2.5h)", "live_art", "fixed", 250.0, 0.0,
               "Minimum live session. Watercolor or fashion sketch style.",
               "From €250; shaped by time/volume.", dream_goal="live_sketching"),
            _s("Live sketching — full afternoon/evening", "live_art", "custom", 0.0, 0.0,
               "Longer on-site presence for bigger parties.", "Price on request.",
               dream_goal="live_sketching"),
            _s("Full stationery suite", "stationery", "custom", 0.0, 0.0,
               "Invitations, seating chart, menus, place cards, welcome sign.", "Discount possible if combined.",
               dream_goal="invitation_suite"),
            _s("Post-event wall portrait of the couple", "live_art", "custom", 0.0, 0.0,
               "Studio-created portrait after the wedding.", ""),
        ],
    },
    {
        "id": "vendor-heart-of-gold",
        "name": "Heart of Gold — Music",
        "categories": ["music_ceremony", "music_aperitif", "music_dinner", "music_dj"],
        "contact_person": "",
        "phone": "",
        "email": "",
        "website": "",
        "instagram": "",
        "location": "",
        "notes": "Folk band with Irish/country/American influences. Trio and duo formats available. Broad repertoire; Spotify-based notes. ~2 hours live repertoire. 3 sound systems. Prices VAT-inclusive. Acoustic setup possible for small groups.",
        "status": "shortlisted",
        "services": [
            _s("Ceremony + DJ", "music_ceremony", "fixed", 1050.0, 0.0,
               "Live ceremony music + DJ for the rest of the evening.",
               "Good value starter package.", dream_goal="ceremony_live_music"),
            _s("Duo + DJ", "music_aperitif", "fixed", 1350.0, 0.0,
               "Duo live + DJ.", "", dream_goal="aperitif_live_music"),
            _s("Trio + DJ", "music_aperitif", "fixed", 1700.0, 0.0,
               "Trio live + DJ.", "", dream_goal="aperitif_live_music"),
            _s("Trio + Violin + DJ", "music_aperitif", "fixed", 2000.0, 0.0,
               "Trio plus violin + DJ.", ""),
            _s("Full band (no DJ)", "music_dinner", "fixed", 1800.0, 0.0,
               "Full band alone.", ""),
            _s("Full band + DJ", "music_dj", "fixed", 2900.0, 0.0,
               "Full band + DJ — the complete package.", "", dream_goal="dj_after_cake"),
        ],
    },
]


def _days(n):
    return (datetime.now(timezone.utc) + timedelta(days=n)).date().isoformat()


SEED_TASKS = [
    {"title": "Finalize venue menu with chef", "category": "venue", "priority": "high", "status": "in_progress",
     "notes": "Ask about Beyti or Lahmacun; mark pork & wine dishes.", "due_date": _days(30)},
    {"title": "Confirm final guest count (2 weeks before)", "category": "venue", "priority": "high", "status": "todo",
     "notes": "Final count no later than 2 weeks before the event.", "due_date": _days(60)},
    {"title": "Book photographer — decide Davide or Max", "category": "photography", "priority": "high",
     "status": "todo", "notes": "Compare quotes and portfolios.", "due_date": _days(20)},
    {"title": "Choose music package (Heart of Gold)", "category": "music_dj", "priority": "medium", "status": "todo",
     "notes": "Compare duo / trio / trio + violin options.", "due_date": _days(25)},
    {"title": "Confirm florist — Symon Mattio", "category": "florals", "priority": "medium", "status": "todo",
     "notes": "Share palette, venue photos, dream items.", "due_date": _days(35)},
    {"title": "Design Turkish corner", "category": "guest_corners", "priority": "low", "status": "todo",
     "notes": "Collect Turkish items, coordinate with decorator.", "due_date": _days(50)},
    {"title": "Design Ireland corner", "category": "guest_corners", "priority": "low", "status": "todo",
     "notes": "Small, tasteful nod to the Irish side.", "due_date": _days(50)},
    {"title": "Prepare guest comfort baskets", "category": "comfort", "priority": "medium", "status": "todo",
     "notes": "Mosquito spray, fans, sunscreen, napkins.", "due_date": _days(45)},
    {"title": "Check if venue piano is tuned & playable", "category": "music_ceremony", "priority": "low",
     "status": "todo", "notes": "Relevant if we hire a pianist.", "due_date": _days(15)},
    {"title": "Request Sonia Ricci sample sketch", "category": "live_art", "priority": "low", "status": "todo",
     "notes": "Free no-obligation sketch offered.", "due_date": _days(10)},
]
