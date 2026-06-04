# Frother

Frother is a lightweight loyalty and offers MVP for hospitality venues. The current public demo is built around a cafe rewards flow: customers join in seconds, staff can look them up at the counter, stamps can be added, rewards can be locked until a profile is complete, and owners can review members, Regulars Radar segments, draft campaigns, and Froffers.

This MVP runs on local mock data only. No Supabase, Square, SMS, or email provider is required for the public demo.

## Local Setup

```bash
npm install
npm run dev
```

Vite serves the app at:

```text
http://localhost:5173/venue/demo-cafe
```

Run a production build with:

```bash
npm run build
```

## Demo Routes

| Route | Purpose |
| --- | --- |
| `/venue/demo-cafe` | Public venue landing page: Demo Cafe Rewards |
| `/venue/demo-cafe/join` | Customer quick join |
| `/venue/demo-cafe/customer/cust-1` | Customer card: Alex, collecting stamps |
| `/venue/demo-cafe/customer/cust-3` | Customer card: Jordan, reward locked until profile completion |
| `/venue/demo-cafe/customer/cust-4` | Customer card: Morgan, reward ready |
| `/staff/demo-cafe` | Staff portal |
| `/admin/demo-cafe` | Admin portal |

Demo credentials:

```text
Staff PIN: 1234
Admin PIN: 9999
```

## Demo Copy

The public venue page currently uses:

```text
Demo Cafe Rewards
Tap in. Stack stamps. Score free coffee.
Join Rewards
10 seconds. No app. No card. Staff can look you up.
```

## Current MVP Status

- Customer quick join with first name, mobile, and optional email
- Customer stamp card with locked and unlocked reward states
- Full profile completion to unlock earned rewards
- Staff PIN flow with customer search, stamp add, and reward redemption
- Admin PIN flow with stats, members, Regulars Radar, draft campaigns, and Froffers
- Campaigns are planning-only and clearly marked: `Draft only — no SMS/email sent yet.`
- Froffers can be listed and edited in the demo admin UI
- Data is in-memory mock data and resets when the app reloads

## Future Roadmap

- Durable database storage and real authentication
- Venue-specific industry presets for cafe, restaurant, pub, and takeaway flows
- Real POS integration after the pilot direction is validated
- Real SMS/email campaign sending after consent, compliance, and provider choice
- Offer redemption tracking for Froffers
- Multi-venue admin setup
- CSV export for owners
- Production analytics and error monitoring

## GitHub Prep

Before pushing:

```bash
npm run build
```

Do not commit local secrets. `.gitignore` excludes:

```text
node_modules
dist
.env
.env.local
```

Only `.env.example` should be committed, and it must contain placeholder values only.

## Netlify Deployment

This repo includes `netlify.toml` for Netlify builds:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify should use:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

The app is a client-side React/Vite app, so `netlify.toml` includes an SPA fallback from `/*` to `/index.html`.
