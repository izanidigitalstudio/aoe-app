# AOE Africa — Web App

A React + Vite web application for Art of Entrepreneurship Africa, connecting to the same Convex backend as the mobile app.

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Setup

### 1. Copy required files from the mobile project

Copy these folders into the webapp directory:

```bash
# From the mobile project root:
cp -r convex/ webapp/convex/
cp -r data/ webapp/data/
```

Your final structure should look like:
```
webapp/
├── convex/          # ← copied from mobile project
├── data/            # ← copied from mobile project
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── theme.ts
├── .env.local
├── package.json
└── ...
```

### 2. Install dependencies

```bash
cd webapp
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

The `.env.local` file is pre-configured with your Convex deployment URL:
```
VITE_CONVEX_URL=https://woozy-mockingbird-215.convex.cloud
```

## Authentication

The web app uses **email/password authentication** via Convex Auth (same as the mobile app's email login). Social auth (Google/Apple) requires additional setup:

- **Google Sign-In**: Add Google OAuth client ID for web in your Convex auth config
- **Apple Sign-In**: Configure Apple Sign-In for web domain

## Building for Production

```bash
npm run build
```

Output is in `dist/`. Deploy to any static host:
- **Vercel**: `npx vercel`
- **Netlify**: drag & drop `dist/` folder
- **Any CDN/server**: serve `dist/` as static files

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast dev server and build tool
- **React Router** — client-side routing
- **Convex** — real-time backend (shared with mobile app)
- **Lucide React** — icons (web equivalent of Ionicons)
- **@convex-dev/auth** — authentication

## Pages

| Route       | Description                                      |
|-------------|--------------------------------------------------|
| `/`         | Home — dashboard with stats, events, projects    |
| `/events`   | Dinner Tour events with RSVP                     |
| `/ai-hub`   | AI resources: funders, tools, guides, cases      |
| `/network`  | Member discovery, connections, messaging          |
| `/profile`  | User profile editing and sign out                |

## Notes

- The web app shares the same Convex backend as the mobile app — all data is synced in real-time
- The UI is fully responsive — works on mobile browsers, tablets, and desktop
- Admin dashboard is not included in the web version (admin-only on mobile)
