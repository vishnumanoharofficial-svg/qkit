# qkit — Premium India Real Estate Marketplace

> **Find Your Perfect Property** — Buy, Sell, Rent or Lease residential, commercial, agricultural and industrial properties across India.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) Razorpay test keys for payments

### 1. Clone & Install

```bash
cd "c:\Users\USER\Documents\New folder\qkit"
npm install
```

### 2. Configure Environment

```bash
copy .env.example .env.local
# Then edit .env.local with your credentials
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RZP_KEY_ID` + `RZP_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | [mapbox.com](https://mapbox.com) → Access Tokens |

### 3. Set Up Database

In your Supabase project → SQL Editor, run:

```
supabase/migrations/001_initial_schema.sql
```

This creates all 30+ tables, indexes, RLS policies, enums, and seeds default categories.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
qkit/
├── app/                    # Next.js 14 App Router pages
│   ├── page.tsx            # Homepage
│   ├── properties/         # All properties browse
│   ├── buy/ rent/ lease/   # Transaction type pages
│   ├── commercial/         # Commercial properties
│   ├── search/             # Search results
│   ├── property/[slug]/    # Property detail page
│   ├── post-property/      # Two-step listing flow
│   ├── login/              # Phone OTP authentication
│   ├── dashboard/          # User dashboard
│   ├── admin/              # Admin control panel
│   └── api/                # API routes
│       ├── properties/     # CRUD for listings
│       ├── payments/       # Razorpay order + verify
│       └── admin/          # Moderation endpoints
├── components/
│   ├── layout/             # Header, Footer
│   ├── home/               # Hero, CategoryCards, PropertySection, HowItWorks
│   └── property/           # PropertyCard, PropertyCardSkeleton
├── lib/
│   ├── constants/          # App-wide constants (categories, states, etc.)
│   ├── types.ts            # Full TypeScript interfaces
│   ├── utils.ts            # formatIndianPrice, convertArea, timeAgo, etc.
│   ├── mock-data.ts        # Realistic dev seed listings
│   └── supabase/           # Server & browser Supabase clients
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Complete DB schema
├── middleware.ts           # Auth session refresh + route protection
├── tailwind.config.ts      # qkit design tokens
└── .env.example            # All required environment variables
```

---

## 🗄️ Database

**30+ tables** covering:
- Users, profiles, roles
- Location taxonomy (states → districts → cities → localities)
- Property categories + dynamic field definitions (admin-managed)
- Property listings + attributes + media
- Favorites, enquiries, conversations, site visits
- Moderation, reports, status history
- Plans, subscriptions, orders, payments (Razorpay)
- Notifications, audit logs, admin settings

All tables have Row Level Security (RLS) enabled for Supabase.

---

## 💳 Payments (Razorpay)

Payment flow is **fully server-side verified**:

1. Client requests order → `POST /api/payments/create-order` (server creates Razorpay order)
2. Client opens Razorpay Checkout (never sees secret key)
3. After payment → `POST /api/payments/verify` (server verifies HMAC-SHA256 signature)
4. Only after server verification does the listing get promoted or subscription activate

**Never trust client-side payment status.**

---

## 🏠 Key Features

| Feature | Status |
|---|---|
| Homepage with Hero, Categories, Featured sections | ✅ |
| Property browse with filters (desktop + mobile) | ✅ |
| Property detail page with gallery + contact | ✅ |
| Two-step Post Property (with photo upload) | ✅ |
| Phone OTP login flow (UI ready) | ✅ |
| User Dashboard | ✅ |
| Admin Dashboard + Moderation | ✅ |
| Supabase DB schema (30+ tables) | ✅ |
| Razorpay server-side payment | ✅ |
| Next.js middleware auth protection | ✅ |
| Mobile-first responsive design | ✅ |
| Supabase connection (needs .env.local) | ⚙️ Needs credentials |
| Real OTP SMS (needs MSG91 key) | ⚙️ Needs credentials |
| Map integration (needs Mapbox token) | ⚙️ Needs credentials |

---

## 🌐 Deployment (Vercel)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial qkit"
git remote add origin https://github.com/yourusername/qkit
git push -u origin main

# 2. Import on Vercel
# vercel.com → New Project → Import GitHub repo

# 3. Add env variables in Vercel dashboard (same as .env.local)

# 4. Deploy — Vercel auto-deploys on every push
```

---

## 🔒 Security Notes

- All admin and moderation routes check user role server-side
- Payment signatures verified with HMAC-SHA256 — never client-side
- `SUPABASE_SERVICE_ROLE_KEY` and `RZP_KEY_SECRET` are **never** exposed to the browser
- File uploads should use Supabase Storage with signed URLs
- Phone numbers are masked in public views (`maskPhone()`)
- RLS policies prevent cross-user data access

---

## 📞 Support

Email: support@qkit.in  
Built with ❤️ for India
