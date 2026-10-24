# Frother

## Connected pilot

The new `/pilot/:slug` customer page and `/pilot/:slug/staff` counter use the existing
Frother Supabase project. The original `/venue`, `/staff`, and `/admin` routes remain
an independent in-memory sample demonstration, even when Supabase is configured.

The pilot supports email/password sign-in, account recovery, saved membership and
balances, optional marketing preferences, individual venue staff permissions,
staff-issued stamps, and atomic reward redemption. Rewards do not require marketing
consent or a marketing profile. Mobile numbers are staff lookup information, not
verified identity or account recovery credentials. No automated messages, Wallet
passes, location notifications, or POS integration are enabled.

### Setup and access

1. Apply both files in `supabase/migrations` in timestamp order
   **once** to the existing Frother project (already applied during implementation).
   This adds prefixed pilot tables without changing legacy tables or functions.
2. Set the two public build variables in `.env.example`. Never use a service-role key.
3. Configure Supabase Auth Site URL and allowed redirect URLs for the production
   domain and pilot paths. Confirm signup and recovery email delivery before inviting
   real customers. Email signup requires confirmation with current project settings.
4. `/pilot/pilot-cafe` is an explicitly labelled test venue. Its rewards have no
   product value. Provision each real venue and staff account before enabling a pilot.
5. Staff create and confirm an email account, then an operator grants access through
   trusted SQL. There is no browser-side role assignment or default staff password.

Example operator provisioning (replace the email and venue slug with verified values):

```sql
insert into public.frother_staff(venue_id,user_id,role)
select v.id,u.id,'owner'
from public.frother_venues v cross join auth.users u
where v.slug='your-venue-slug'
  and lower(u.email)=lower('verified-owner@example.com')
  and u.email_confirmed_at is not null
on conflict(venue_id,user_id) do update set role='owner',active=true;
```

Only grant staff access to an account you have independently verified. Staff and
owner roles can use the counter for their assigned venue. The pilot currently
loads up to 500 members for staff lookup; larger venues need server pagination.

### Validation

- `npm run build` compiles the complete app.
- Run `supabase/tests/pilot-security.sql` through the SQL editor or authenticated
  operator connection. Its synthetic users and venues roll back. It checks direct
  write denial, cross-member and cross-venue access, retry idempotency, stale card
  versions, earned reward checks, leftover stamps, consent, and audit events.
- `tests/pilot-api.mjs` tests actual email/password sessions and API operations,
  including simultaneous redemption. Provide a disposable fixture JSON through
  `FROTHER_TEST_FIXTURE`, containing `slug`, `venueId`, `staffEmail`, `customerEmail`,
  and `password`, plus the public `VITE_SUPABASE_PUBLISHABLE_KEY` environment value.
  Accounts must be synthetic and confirmed; staff needs a membership in the test venue.
- `tests/pilot-browser.mjs` exercises customer join, reload, a separate browser
  context, staff stamps and redemption, consent, and staff denial. It requires
  Playwright Chromium (`npx playwright install chromium`) and the same fixture.
  Use a fresh venue/member for each test; the API suite mutates the test card.
  Set `FROTHER_TEST_URL` to a local or deployed preview. Never commit fixture secrets.

The pre-existing live Netlify site was uploaded separately and its source differs
from this repository. Review a preview before replacing that production deployment.
The new pilot permissions do not harden legacy RPCs; those need a separate review
before putting real customer data into legacy routes.

## Sample demonstration

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
