# Ledger — Financial Analytics Dashboard

A full-stack financial analytics dashboard: JWT-authenticated access to interactive revenue/expense visualizations, a searchable and filterable transaction table, and a configurable CSV export system with a live preview before download.

## Project Overview

Financial analysts need a single place to track company transactions, spot revenue/expense trends, and pull filtered reports for stakeholders. This app provides:

- A dashboard of KPIs (revenue, expenses, net cash flow, pending count) and charts (monthly trend, category split, status distribution), all driven by MongoDB aggregation pipelines.
- A transaction table with server-side pagination, multi-field filtering, column sorting, and debounced real-time search — filters persist in the URL so a filtered view can be bookmarked or shared.
- A CSV export modal where the user picks and reorders columns, previews the record/column count and estimated file size, and downloads a correctly formatted CSV that respects whatever filters are currently applied.
- A reusable alert-chip system for consistent success/error/warning feedback throughout the app.

## Features

- JWT authentication via httpOnly cookies, with a rate-limited login endpoint
- Protected routes on both the API (auth middleware) and the frontend (route guard)
- Dashboard KPI cards and three chart types (trend, category, status), each with loading/empty states
- Dashboard-wide quick filters that synchronize KPIs and all charts together
- Transaction table: sorting, pagination, multi-field filters (date range, amount range, category, status, user), debounced search, quick-filter chips, "Clear filters"
- Filters persisted in URL query params (shareable/refreshable views)
- Configurable CSV export: select/reorder columns, select-all/clear-all, live export preview, filtered export, automatic browser download, RFC 4180-safe CSV escaping
- Centralized error handling on both ends; alert chips for every failure mode (login, fetch, export, validation, session expiry, network)
- Skeleton loaders, disabled states, and empty states throughout
- MongoDB indexes on all commonly filtered/sorted fields
- Idempotent seed script (safe to re-run) that loads the provided dataset via upsert

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, React Router, Material UI, Recharts, TanStack Query, Axios, React Hook Form, Zod

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT (httpOnly cookies), bcryptjs, json2csv, Zod, Helmet, express-rate-limit

**Tooling:** ESLint, Jest + Supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend), Docker Compose (MongoDB)

## Architecture

```
financial-analytics-dashboard/
├── frontend/   React SPA — pages/components/hooks/api client, MUI theme
├── backend/    Express API — routes → controllers → services → Mongoose models
├── data/       Provided transactions.json (source of truth for the seed script)
├── README.md
├── API.md
└── docker-compose.yml   # local MongoDB
```

The backend follows a layered structure: **routes** wire URLs to auth + validation middleware and a controller; **controllers** are thin HTTP adapters; **services** hold business logic (filter building, aggregation pipelines, CSV generation) so it's shared and testable independently of Express. A single `buildTransactionFilter()` helper is reused by the transaction list, every dashboard endpoint, and the export endpoint, so filter semantics never drift between them.

The frontend keeps server state (transactions, dashboard metrics) in TanStack Query and local UI state (modal open/closed, export column selection) in component state, with filters/sort/pagination lifted into the URL via `useSearchParams` so views are shareable.

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local install, or use the provided `docker-compose.yml`)
- npm

## Installation

```bash
git clone <this-repo-url>
cd financial-analytics-dashboard
```

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit if needed
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # edit if needed
```

## Environment Variables

**backend/.env**
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/financial_dashboard
JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
DEMO_EMAIL=demo@financeapp.com
DEMO_PASSWORD=Demo@1234
```

**frontend/.env**
```
VITE_API_URL=http://localhost:4000/api
```

## Database Setup

Start MongoDB, either locally or via Docker:
```bash
docker compose up -d
```

Then seed it with the provided dataset (creates the demo login user too). The script upserts by transaction `id`, so it's safe to run more than once:
```bash
cd backend
npm run seed
```
To wipe and reimport from scratch instead:
```bash
npm run seed:reset
```

## Running the Project

**Backend** (http://localhost:4000):
```bash
cd backend
npm run dev
```

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` and log in.

## Demo Credentials

```
Email:    demo@financeapp.com
Password: Demo@1234
```

## API

See [API.md](./API.md) for full endpoint documentation, request/response examples, and error codes.

## Design Decisions

- **httpOnly cookies over localStorage for the JWT** — avoids exposing the token to XSS; the Axios client sends `withCredentials: true` and the API sets `SameSite=Lax` (or `None`+`Secure` in production) plus CORS with a specific `CLIENT_URL` origin.
- **Aggregation pipelines, not in-memory math** — all dashboard metrics are computed in MongoDB (`$group`, `$cond`, `$year`/`$month`) so the API stays fast and correct as data grows, rather than pulling every document into Node and reducing it there.
- **A single shared filter builder** — `buildTransactionFilter()` is the only place that turns user input into a Mongo query, used identically by the list, dashboard, and export endpoints, so a filter can never behave differently in the table versus the export.
- **Whitelisted sort fields** — `sortBy` is validated against a fixed enum before it ever reaches Mongo, preventing arbitrary-field injection into the sort stage.
- **URL as the source of truth for table state** — filters/sort/pagination live in query params (not component state), so a filtered, sorted view is bookmarkable and survives a refresh.
- **IBM Plex Mono for numeric data** — dates, amounts, and IDs render in a monospace face for ledger-style tabular alignment; this is a functional choice for scanning numbers, not decoration.

## Future Improvements

- Role-based access (analyst vs. admin) and per-user data scoping
- Saved filter views (name a filter combination and restore it later)
- Server-sent events or polling for near-real-time transaction updates
- Cursor-based pagination for very large datasets
- Refresh-token rotation instead of a single long-lived JWT
- CSV export to a background job + email link for very large exports

## Known Limitations

- `mongodb-memory-server`-based backend integration tests require outbound internet access on first run (to download the `mongod` binary) — they were written and are correct, but weren't executed in the sandboxed build environment for that reason. The pure-logic backend tests and the full frontend test suite were run and pass.
- The initial JS bundle is a single ~1 MB chunk; code-splitting (route-based `React.lazy`) would improve first-load time for a larger app.
