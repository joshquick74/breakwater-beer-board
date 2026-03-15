# Beer Board - Digital Restaurant Menu

## Overview

A digital beer board web app for Breakwater Barbecue restaurant. Has two parts:
1. **Public Display** (`/board`) — Full-screen portrait beer menu for Fire TV digital signage
2. **Admin Panel** (`/admin`) — Mobile-friendly password-protected management interface
3. **API Docs** (`/docs`) — Interactive API documentation page

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS v4
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI Components**: shadcn/ui (admin), custom styled (board)
- **Drag & Drop**: @hello-pangea/dnd

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── beer-board/         # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (seed, etc.)
├── uploads/                # Uploaded background/logo images
└── attached_assets/        # Reference images
```

## Key Pages

- `/` — Landing page with links to board, admin, and API docs
- `/board` — Public beer display (portrait, rotated for Fire TV)
- `/admin` — Admin dashboard (requires login)
- `/login` — Password login page
- `/docs` — Interactive API documentation

## Environment Variables

- `ADMIN_PASSWORD` — Password for admin login
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)

## Database Schema

### beers table
- id, tap_number, beer_name, brewery, style, abv, price, available, position

### board_settings table
- id, header_title, google_font_header, google_font_body, accent_color, text_color, overlay_enabled, overlay_opacity, background_image_url, logo_image_url, logo_size_percent

## API Endpoints

All write endpoints require `Authorization: Bearer <token>` header.

### Public (no auth)
- `GET /api/beers` — List all beers
- `GET /api/settings` — Get board settings

### Protected (auth required)
- `POST /api/beers` — Create beer
- `PATCH /api/beers/:id` — Update beer
- `DELETE /api/beers/:id` — Delete beer
- `PATCH /api/beers/reorder` — Reorder beers
- `PATCH /api/settings` — Update settings
- `POST /api/upload/background` — Upload background image
- `POST /api/upload/logo` — Upload logo image

### Auth
- `POST /api/admin/login` — Get auth token (body: `{"password": "..."}`)

## Board Display

- Designed for 1080x1920 portrait orientation
- CSS rotates content 270° for Fire TV landscape output → portrait TV
- Auto-refreshes every 30 seconds
- Supports custom background image, overlay, Google Fonts, text color
- Logo displayed from uploaded image or bundled fallback
- Logo size adjustable via admin

## Admin Features

- Add/edit/delete beers
- Drag-and-drop reorder
- Upload background image and logo
- Toggle/adjust overlay opacity
- Change font (15 presets + custom Google Font)
- Change text color
- Adjust logo size
- Preview board button

## Auth Middleware

- `artifacts/api-server/src/middleware/auth.ts` — `requireAuth` middleware checks Bearer token
- Tokens are generated at login and stored in-memory (Set)
- Applied to all POST/PATCH/DELETE routes except login
