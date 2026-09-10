# Volunteer Hub

Volunteer Hub keeps the original Next.js, React, HTML, CSS, and page structure while moving application data to a local Go backend.

## Run the Go backend

From the repository root:

```powershell
$env:VOLUNTEERHUB_ADMIN_EMAIL = "admin@example.com"
$env:VOLUNTEERHUB_ADMIN_PASSWORD = "use-a-secret-password"
go run ./cmd/server
```

The Go API listens on `http://localhost:8080`.

## Run the Next.js frontend

In a second terminal:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend data client is [goApi.ts](goApi.ts), which calls the local Go server. Firebase is no longer used or required.

## Main API routes

- `GET /health`
- `GET /api/events`
- `POST /api/events`
- `GET /api/members`
- `POST /api/members`
- `POST /api/auth`
- `POST /api/auth/admin`
- `POST /api/signups`
- `GET /api/hours?email=user@example.com`
- `POST /api/approvals`

## Verification

```powershell
go test ./...
go build ./...
npm run build
```

The Go service currently stores data in memory. Restarting the backend clears local data; add a Go database adapter later if persistence is needed.
