# API Documentation

Base URL: `http://localhost:4000/api`

All endpoints return JSON in one of two shapes:

**Success**
```json
{ "success": true, "data": { ... } }
```

**Error**
```json
{ "success": false, "message": "Human-readable message", "error": { "code": "MACHINE_CODE" } }
```

Paginated list endpoints additionally include a `pagination` object alongside `data`.

Authentication uses a JWT stored in an **httpOnly cookie** (`fad_token`), set automatically on login. All requests from the frontend must be made with `credentials: 'include'` (the provided Axios client already does this). A `Bearer <token>` header is also accepted as a fallback for API testing tools like Postman/curl.

---

## Auth

### `POST /api/auth/login`
Authenticate with email + password and receive an auth cookie.

- **Auth required:** No
- **Rate limit:** 10 requests / 15 min per IP

**Body**
```json
{ "email": "demo@financeapp.com", "password": "Demo@1234" }
```

**200 Response**
```json
{ "success": true, "data": { "user": { "id": "…", "name": "Demo Analyst", "email": "demo@financeapp.com" } }, "message": "Login successful" }
```

**Errors**
| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid email or password |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 429 | `LOGIN_RATE_LIMITED` | Too many attempts |

**Example**
```bash
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@financeapp.com","password":"Demo@1234"}'
```

---

### `POST /api/auth/logout`
Clears the auth cookie.

- **Auth required:** No (safe to call regardless of session state)

**200 Response**
```json
{ "success": true, "data": null, "message": "Logged out" }
```

---

### `GET /api/auth/me`
Returns the currently authenticated user.

- **Auth required:** Yes

**200 Response**
```json
{ "success": true, "data": { "user": { "id": "…", "name": "Demo Analyst", "email": "demo@financeapp.com" } } }
```

**Errors**: `401 AUTH_REQUIRED` / `401 SESSION_EXPIRED`

---

## Transactions

### `GET /api/transactions`
Paginated, filtered, sorted transaction list.

- **Auth required:** Yes

**Query parameters**
| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1` |
| `limit` | integer | Default `20`, max `100` |
| `search` | string | Matches id/category/status/user_id/amount |
| `startDate` | ISO date | Inclusive lower bound on `date` |
| `endDate` | ISO date | Inclusive upper bound on `date` |
| `minAmount` | number | Inclusive lower bound on `amount` |
| `maxAmount` | number | Inclusive upper bound on `amount` |
| `category` | `Revenue` \| `Expense` | |
| `status` | `Paid` \| `Pending` | |
| `userId` | string | Exact match, e.g. `user_001` |
| `sortBy` | `date`\|`amount`\|`category`\|`status`\|`id`\|`user_id` | Default `date`. Whitelisted server-side. |
| `sortOrder` | `asc`\|`desc` | Default `desc` |

**200 Response**
```json
{
  "success": true,
  "data": [
    { "id": 1, "date": "2024-01-15T08:34:12.000Z", "amount": 1500, "category": "Revenue", "status": "Paid", "user_id": "user_001", "user_profile": "https://thispersondoesnotexist.com/" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 300, "totalPages": 15 }
}
```

**Errors**: `400 VALIDATION_ERROR` (e.g. invalid `sortBy`, `minAmount > maxAmount`), `401 AUTH_REQUIRED`

**Example**
```bash
curl -b cookies.txt "http://localhost:4000/api/transactions?category=Revenue&status=Paid&sortBy=amount&sortOrder=desc&page=1&limit=20"
```

---

### `GET /api/transactions/:id`
Fetch a single transaction by its numeric `id`.

- **Auth required:** Yes

**200 Response**
```json
{ "success": true, "data": { "id": 1, "date": "…", "amount": 1500, "category": "Revenue", "status": "Paid", "user_id": "user_001", "user_profile": "…" } }
```

**Errors**: `404 TRANSACTION_NOT_FOUND`

---

## Dashboard

All dashboard endpoints accept the same optional filter query params: `startDate`, `endDate`, `category`, `status`, `userId`. Metrics are computed with MongoDB aggregation pipelines, not in application code.

### `GET /api/dashboard/summary`
```json
{ "success": true, "data": { "totalRevenue": 125000, "totalExpenses": 42000, "netCashFlow": 83000, "pendingCount": 34, "paidCount": 266, "totalCount": 300 } }
```

### `GET /api/dashboard/trends`
Monthly revenue/expense totals, sorted chronologically.
```json
{ "success": true, "data": [ { "period": "2024-01", "revenue": 12000, "expenses": 4500 }, { "period": "2024-02", "revenue": 9800, "expenses": 5200 } ] }
```

### `GET /api/dashboard/categories`
```json
{ "success": true, "data": [ { "category": "Revenue", "total": 125000, "count": 180 }, { "category": "Expense", "total": 42000, "count": 120 } ] }
```

### `GET /api/dashboard/status`
```json
{ "success": true, "data": [ { "status": "Paid", "total": 150000, "count": 266 }, { "status": "Pending", "total": 17000, "count": 34 } ] }
```

All four: **Auth required: Yes**. Errors: `400 VALIDATION_ERROR`, `401 AUTH_REQUIRED`.

---

## Reports (CSV Export)

### `POST /api/reports/export`
Generates a CSV of transactions matching the given filters and columns, and streams it back with headers set for browser download.

- **Auth required:** Yes

**Body**
```json
{
  "columns": ["id", "date", "amount", "category", "status", "user_id"],
  "filters": { "category": "Revenue", "status": "Paid", "startDate": "2024-01-01", "endDate": "2024-06-30" }
}
```
`columns` must be a non-empty subset of `id`, `date`, `amount`, `category`, `status`, `user_id`, `user_profile`. `filters` is optional and accepts the same fields as the transactions list endpoint (minus pagination/sort).

**200 Response**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="financial-report-2024-06-30.csv"`, body is the CSV text (RFC 4180-compliant escaping for commas/quotes/newlines).

**Errors**: `400 VALIDATION_ERROR` (empty `columns`), `401 AUTH_REQUIRED`

**Example**
```bash
curl -b cookies.txt -X POST http://localhost:4000/api/reports/export \
  -H "Content-Type: application/json" \
  -d '{"columns":["id","date","amount","category","status"],"filters":{"category":"Revenue"}}' \
  -o report.csv
```

### `POST /api/reports/export/preview`
Same body as above; returns record/column/estimated-size counts without generating the file, used to power the export modal's live preview.

**200 Response**
```json
{ "success": true, "data": { "recordCount": 42, "columnCount": 6, "estimatedBytes": 3024 } }
```

---

## Error Codes Reference

| Code | Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/query failed schema validation |
| `AUTH_REQUIRED` | 401 | No auth cookie/token present |
| `SESSION_EXPIRED` | 401 | Token invalid or expired |
| `INVALID_CREDENTIALS` | 401 | Login email/password mismatch |
| `USER_NOT_FOUND` | 401 | Token valid but user no longer exists |
| `LOGIN_RATE_LIMITED` | 429 | Too many login attempts |
| `TRANSACTION_NOT_FOUND` | 404 | No transaction with that id |
| `ROUTE_NOT_FOUND` | 404 | Unknown route |
| `INTERNAL_ERROR` | 500 | Unexpected server error (details never leaked to the client) |
