# Beer Board - Digital Restaurant Menu

## Overview

A digital beer board web app for a restaurant, replacing Canva-based menu boards. Has two parts:
1. **Public Display** (`/board`) — Full-screen portrait beer menu for Fire TV digital signage
2. **Admin Panel** (`/admin`) — Mobile-friendly password-protected management interface

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
├── uploads/                # Uploaded background images
└── attached_assets/        # Reference images
```

## Key Pages

- `/` — Landing page with links to board and admin
- `/board` — Public beer display (portrait, rotated for Fire TV)
- `/admin` — Admin dashboard (requires login)
- `/login` — Password login page

## Environment Variables

- `ADMIN_PASSWORD` — Password for admin login (default: "changeme123")
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)

## Database Schema

### beers table
- id, tap_number, beer_name, brewery, style, abv, price, available, position

### board_settings table
- id, header_title, google_font_header, google_font_body, accent_color, overlay_enabled, overlay_opacity, background_image_url

## API Endpoints

- `GET /api/beers` — List all beers
- `POST /api/beers` — Create beer
- `PATCH /api/beers/:id` — Update beer
- `DELETE /api/beers/:id` — Delete beer
- `PATCH /api/beers/reorder` — Reorder beers
- `GET /api/settings` — Get board settings
- `PATCH /api/settings` — Update settings
- `POST /api/admin/login` — Admin login
- `POST /api/upload/background` — Upload background image

## Board Display

- Designed for 1080x1920 portrait orientation
- CSS rotates content 270° for Fire TV landscape output → portrait TV
- Auto-refreshes every 30 seconds
- Supports custom background image, overlay, Google Fonts, accent color

## Admin Features

- Add/edit/delete beers
- Drag-and-drop reorder
- Upload background image
- Toggle/adjust overlay opacity
- Change Google Fonts (header + body)
- Change accent color
- Change restaurant name
- Preview board button
