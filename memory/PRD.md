# Veronica's Dream Wedding — Cuneo

## Problem Statement
Private wedding planning command center for the couple (user + Veronica) for their wedding in Cuneo, Piedmont (Italy). Built from a detailed brief the user provided as a Word document. The app is for personal use only (no auth — private URL).

The tool must replace their scattered notes and a broken Excel with one calm, beautiful, decision-focused dashboard that:
- Lets them see their dream vision, budget, vendors, selections, tasks and total cost at a glance
- Is NOT a spreadsheet — it should reduce stress, not add to it
- Uses a sage / dusty rose / muted gold / warm ivory palette
- Ships with real, seeded data (their actual vendors and notes from Cuneo)

## User Personas
1. **The couple (user + Veronica)** — non-technical users planning their Italian wedding. Stressed, multitasking, want clarity over completeness.

## Architecture
- **Backend**: FastAPI + Motor/MongoDB. Singleton `project` + collections `vendors`, `selections`, `tasks`. Categories & goals are constants. Auto-seeds on first boot with 6 real vendors, 10 tasks, 16 dream categories, 21 dream goals.
- **Frontend**: React 19 + React Router + shadcn/ui + Tailwind. Single `PlannerProvider` context for data. 8 pages + layout with sidebar nav.
- **Styling**: Custom sage/rose/gold palette via CSS variables, Cormorant Garamond (heading) + Manrope (body), soft shadows, dashed dividers, floral gradient backgrounds.

## Implemented (Dec 2025)
- ✅ Backend: 8 API groups with CRUD for Project, Vendors, VendorServices (embedded), Selections, Tasks + Dashboard aggregation + Seed endpoint
- ✅ Live total calculation: per-guest pricing multiplies by project.guest_count; recalculates on quantity/status changes
- ✅ Seeded vendors: La Locanda del Nocciolo (12 services inc. €80/adult package, rooms, chocolate fountain), Symon Mattio (florals), Davide Giuseppe Tolis (photography), Max/Maximilliano (photo+video), Sonia Ricci (live sketching + stationery), Heart of Gold (6 music packages from €1050 to €2900)
- ✅ Seeded tasks: 10 tasks with priorities and due dates pulled from the brief
- ✅ Dashboard: countdown, target vs chosen budget, stats cards (booked/selected/considering/vendors), by-category breakdown, next tasks
- ✅ Dream Vision: 21 goals grouped by category with real images (florals, Turkish corner, chocolate fountain, live sketching, lanterns etc.)
- ✅ Plan Builder: 6-step wizard (Category → Goal → Vendor → Service → Details → Confirm) with live sidebar summary and auto-calculated totals
- ✅ Vendors directory: card grid, add/edit dialogs, embedded service management per vendor
- ✅ Final Decisions: grouped by category with inline status transitions and running totals
- ✅ Tasks: 3-column kanban (To do / In progress / Done) with add/edit/move/delete
- ✅ Budget: target vs chosen, deposits, must-have / nice-to-have / optional split, accordion drill-down by category
- ✅ Settings: couple names, wedding date, location, guest count, budget, style notes + reseed action

## Backlog / Future
### P1
- Wedding date is currently not set — user should pick in Settings to activate countdown
- Export final plan to PDF (for sharing with vendors)
- Side-by-side vendor comparison view (mentioned in brief; currently only Plan Builder shows one at a time)

### P2
- Menu builder with Italian dishes + pork/wine allergen marking (from brief's "Menu Strategy for Muslim Guests" section)
- Timeline / day-of schedule generator
- Guest list module (names + RSVP + table assignment)
- Moodboard image uploads
- AI suggestions (dream goal ideas, task recommendations)

### P3
- Multi-project (if they later help friends plan)
- Share a read-only view with vendors via token link
- Mobile PWA installability

## Testing
- Backend: 15/15 pytest tests passing (iteration_1.json); covers all CRUD paths, total calculation logic, seed idempotency.
- Frontend: Screenshots confirm Dashboard, Dream Vision, Plan Builder render correctly. No auth — private URL.

## Credentials
None — this is a single-user private app with no authentication. The private URL is the only gate.
