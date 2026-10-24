# Frother

## Connected pilot — collect first, details at first reward

- `/pilot/:slug` opens a saved guest card immediately, with **no upfront form or account**.
- Staff use `/pilot/:slug/staff` with an individual account and venue permission.
- Staff look up the visible card number and award stamps for eligible purchases.
- At the reward threshold the card says **Complete details to claim**.
- The customer verifies email/account access, provides name and mobile, and optionally
  selects marketing preferences. The existing guest card and its stamps are linked
  to that verified account. Staff can then redeem the reward once.
- Registration is required for redemption; marketing consent is never required.
- The first-tap page discloses the details requirement before purchases accumulate.
- No Wallet passes, location reminders, automated campaigns, or POS integrations.

### Guest privacy and recovery

The browser generates a 256-bit private key and saves it in localStorage. The backend
stores only its SHA-256 digest in a private table. The public guest RPC returns card
state and a visible staff lookup number, not contact details or credentials. Requests
carry the key in the POST body, never the URL. A guest key cannot award stamps.

Customers can copy a private recovery key and restore it on another browser. Anyone
with the key can open and register that guest card, so the interface tells customers
to keep it private. The visible card number is **not** a recovery credential. Without
saved browser data or the key, anonymous ownership cannot be reconstructed from a
name/mobile. After verification, the old guest key stops opening the card and the
customer uses email/password recovery. Existing registered and earned guest cards
are preserved separately; combining them needs operator assistance.

Guest-card creation is idempotent for a given key and limited to 200 new cards per
forwarded client IP per day when request headers are present. No IP address is stored
in plaintext. This is a pilot guard, not a complete public-launch abuse-control system.

### Setup and access

Apply the migrations in `supabase/migrations` in timestamp order once. They have
already been applied to the existing Frother Supabase project. They add isolated
prefixed pilot tables without changing legacy tables/functions. Set the public build
variables in `.env.example`; never put a service-role key in browser code.

Configure Supabase Auth Site URL and allowed redirect URLs for the production and
preview pilot paths. Verify signup confirmation and recovery delivery before inviting
real customers. Email confirmation is enabled in the current project settings.

`/pilot/pilot-cafe` is a labelled test venue; rewards have no product value. Provision
real venues and verified staff accounts before use. Staff permissions are assigned
by a trusted operator, with no default password or browser-side role assignment:

```sql
insert into public.frother_staff(venue_id,user_id,role)
select v.id,u.id,'owner'
from public.frother_venues v cross join auth.users u
where v.slug='your-venue-slug'
  and lower(u.email)=lower('verified-owner@example.com')
  and u.email_confirmed_at is not null
on conflict(venue_id,user_id) do update set role='owner',active=true;
```

Verify the owner independently before granting access. The pilot counter loads up to
500 cards; larger venues need server pagination. Legacy RPC permissions still need
separate review before using legacy flows with real customer data.

### Validation

- `npm run build` compiles the complete app.
- `supabase/tests/pilot-security.sql` checks authenticated access, venue isolation,
  no customer stamp writes, action idempotency, card versions, surplus stamps and consent.
- `supabase/tests/guest-reward-flow.sql` checks guest opening/recovery, staff stamps,
  the registration gate, email verification, same-card linking, token revocation,
  optional consent, and safe redemption. Both SQL suites roll back all fixtures.
- `tests/pilot-api.mjs` tests real guest/account/staff API requests with disposable
  fixture accounts. Set `FROTHER_TEST_FIXTURE` and the public
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Never commit fixture credentials.
- `tests/pilot-browser.mjs` exercises the guest screen, reload, staff stamps, reward
  prompt, verified account linking and redemption. It needs Playwright Chromium,
  a fresh disposable fixture, and `FROTHER_TEST_URL` (defaults to local Vite).

The current production Netlify site was uploaded separately and differs from this
repository. Review the updated preview before replacing production.

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
