# Wasty Scheduler (Full‑Stack Demo)

A small admin tool to manage employees and schedule their shifts. Built with Angular (front‑end) and FastAPI + SQLite (back‑end). Includes a simple analytics view of total shifts per employee.

## Features

- Employees: add, list, edit, delete with role.
- Calendar scheduling: month/week view, assign shifts, optional note, edit/delete.
- Summary/analytics: total shifts per employee with optional date range.
- Clean, simple UI with consistent components.

## Tech Stack

- Front‑end: Angular 20
- Back‑end: FastAPI, Pydantic, SQLAlchemy, SQLite.

## Prerequisites

- Node.js 18+ and npm
- Python 3.12+

## Setup & Run

1. Back‑end (FastAPI)

```bash
# from repo root
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

# Run dev server (http://localhost:8000)
uvicorn api.main:app --reload
```

- SQLite DB file: `scheduler.db` in repo root (auto‑created on first run)
- CORS allows `http://localhost:4200` by default

2. Front‑end (Angular)

```bash
cd web
npm install
npm start  # ng serve
```

- Dev server: http://localhost:4200
- The app calls the API at `http://localhost:8000`

## Endpoints (Back‑end)

- Employees
  - GET `/employees`
  - POST `/employees`
  - PUT `/employees/{id}`
  - DELETE `/employees/{id}`
- Schedule
  - GET `/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD` (filters optional)
  - POST `/schedule`
  - PUT `/schedule/{id}`
  - DELETE `/schedule/{id}`
- Analytics
  - GET `/analytics?start=YYYY-MM-DD&end=YYYY-MM-DD`

## Front‑end Structure

- `web/src/app/features/employees/*`: employee CRUD screen
- `web/src/app/features/schedule/*`: calendar
- `web/src/app/features/summary/*`: analytics table
- `web/src/app/core/*`: HttpClient services for API
- `web/src/styles.css`: global tokens and primitives (cards, buttons, inputs)

## Docs

- Approach: docs/approach.md
