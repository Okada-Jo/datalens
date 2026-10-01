# DataLens

DataLens is a browser-based CSV exploration and cleaning app built with React, TypeScript, Django REST Framework, and pandas.

Upload a CSV, inspect its structure, explore and filter the data, apply non-destructive transformations, create visualizations, and export the result.

## Screenshots

> Screenshots coming after the final UI pass.

<!--
![Overview](docs/screenshots/overview.png)
![Explore](docs/screenshots/explore.png)
![Clean](docs/screenshots/clean.png)
![Visualize](docs/screenshots/visualize.png)
-->

## Features

- CSV upload and automatic dataset analysis
- Search, filtering, sorting, and pagination
- URL-backed explorer state
- Fill missing values
- Replace values
- Rename and delete columns
- Ordered transformation history with undo
- Bar and line charts with sum, average, and count aggregations
- CSV and JSON export
- Original uploaded files remain unchanged until automatic deletion after 24 hours
- Light, dark, and system themes

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, TanStack Table, React Router, Recharts, Zod

**Backend:** Python, Django REST Framework, pandas, SQLite

**Development:** Docker, Docker Compose

## How It Works

DataLens uses a non-destructive transformation pipeline.

Instead of modifying the uploaded CSV, cleaning operations are stored separately and applied in order:

```text
Original CSV
    ↓
Fill missing values
    ↓
Rename column
    ↓
Replace values
    ↓
Current DataFrame
```

The same transformed dataset is then used by the explorer, charts, and exports.

This keeps the original upload immutable and gives the application a single source of truth for the current dataset state.

## Running the Project

### Docker

```bash
git clone git@github.com:Okada-Jo/datalens.git
cd datalens

docker compose up --build
```

Then open:

```text
http://localhost:5173
```

The Django API runs at `http://localhost:8000/api/`.

### Without Docker

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Run the retention worker in a separate terminal (required for deletion while idle):

```bash
cd backend
source .venv/bin/activate
python manage.py cleanup_datasets --watch
```

Docker Compose starts this worker automatically. Uploads expire 24 hours after creation, including failed uploads. The API refuses expired datasets immediately; the worker removes files, analysis, and transformations on its next sweep (every second). Keep the worker running: downtime or storage failures delay physical deletion until recovery. Downloads already saved by users are outside this policy. For a one-off sweep, run `python manage.py cleanup_datasets`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend API URL can be configured using `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

See `frontend/.env.example`.

## Tests

The backend has 37 automated tests covering the transformation pipeline, querying, exports, chart aggregation, models, and API behavior.

```bash
cd backend
python manage.py test datasets.tests
```

Frontend quality checks:

```bash
cd frontend
npm run lint
npm run build
```

## Scope

DataLens is intentionally a small project. It currently supports CSV files up to 25 MB and uses local SQLite/file storage.

It does not include authentication, cloud storage, arbitrary SQL, or large-scale data processing.

The focus is the core workflow:

**Upload → Explore → Clean → Visualize → Export**
