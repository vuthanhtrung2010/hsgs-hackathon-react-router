# HSGS Hackathon Frontend

Leaderboard, student progress analytics, and administration interface for the HSGS Hackathon platform. Built with React Router v7, React 19, TypeScript, and Tailwind CSS.

## Overview

The frontend serves both public participants and administrators:

- Public Leaderboard: Ranked student standings with DMOJ-style rating tiers, weighted ELO ratings, completed quizzes, debt counts, and motivational quotes.
- Rating Visuals: Tier-specific badges and animated gradient indicators, including solar flare gradients for Target rank (2400+) and RGB rainbow wave effects for Admin rank (3000+).
- Sub-Leaderboards: Cohort-specific leaderboards and student group tracking.
- Problem Explorer: Browse, filter, and inspect curriculum problems classified by subject cluster and difficulty.
- Admin Management Portal:
  - Courses: Configure course display parameters, quote attributions, student debt display, and custom rating thresholds with real-time tier range validation.
  - Sub-Leaderboards: Create, populate, and delete custom student cohorts.
  - Announcements: Author and publish markdown announcements.
  - Users: View user profiles and submission histories.

## Tech Stack

- Runtime and Package Manager: Bun
- Framework: React Router v7 (SSR and server actions via `@react-router/node` and `@react-router/serve`)
- UI and Styling: React 19, Tailwind CSS v4, Radix UI primitives, Lucide React
- Data Visualization: Chart.js and Recharts for skill radars and rating distributions
- Authentication: Session-based cookie authentication backed by Better Auth

## Prerequisites

- Bun v1.1.0 or newer
- Running instance of the HSGS Hackathon backend API

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Set the following variables in `.env`:

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend API (without trailing slash) | `http://localhost:3001` |
| `PORT` | Local port for the frontend server | `3000` |
| `VITE_GEN_API_BASE_URL` | Optional endpoint for the AI problem generation service | Empty |

3. Start development server:

```bash
bun run dev
```

The application starts at `http://localhost:5173`.

## Verification and Testing

- Run unit and integration tests:

```bash
bun test
```

- Run type checking and route artifact generation:

```bash
bun run typecheck
```

- Create production build:

```bash
bun run build
```

## Production Deployment

### Method 1: Standalone Process

1. Build the production bundle:

```bash
bun run build
```

2. Start the built server:

```bash
bun run start
```

Or execute the server entrypoint directly:

```bash
bun x react-router-serve ./build/server/index.js
```

Example systemd unit file (`/etc/systemd/system/hsgs-frontend.service`):

```ini
[Unit]
Description=HSGS Hackathon Frontend
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/hsgs-hackathon-react-router
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=VITE_API_BASE_URL=https://api.example.com
ExecStart=/usr/local/bin/bun x react-router-serve ./build/server/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Method 2: Docker Container

1. Build the Docker image:

```bash
docker build -t hsgs-frontend .
```

2. Run the container:

```bash
docker run -d \
  --name hsgs-frontend \
  -p 3000:3000 \
  -e VITE_API_BASE_URL="https://api.example.com" \
  --restart unless-stopped \
  hsgs-frontend
```

### Reverse Proxy Configuration (Nginx)

Proxy incoming requests to the internal Node/Bun port while passing through cookies and client headers:

```nginx
server {
    listen 80;
    server_name leaderboard.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
