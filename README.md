# SiteReady GCC (منصة الامتثال وسلامة المقاولين)

> **Enterprise Bilingual Contractor Compliance, Workforce Safety & Training SaaS Platform**  
> Tailored for small and medium-sized construction, maintenance, contracting, and facilities management companies operating in Saudi Arabia and the GCC (aligned with Saudi Aramco, NEOM, Red Sea Global, and the Saudi Building Code SBC).

---

## 1. Executive Product Overview

**SiteReady GCC** provides contracting companies with an end-to-end, audit-ready compliance operating system that replaces spreadsheets, WhatsApp paper trails, and unverified worker gate passes.

### Core Capabilities:
- **Workforce & Iqama Dossiers:** Full employee records with Iqama/National ID validation (10 digits), job titles, nationalities, assigned project sites, and Qiwa platform verification indicators.
- **Safety Certifications & Competency Register:** Tracks certificates (Saudi Aramco Rigging, NEBOSH IGC, TÜV Crane Inspector, Scaffold Inspector, First Aid, Heavy Equipment licenses). Expiry status is dynamically computed from server dates (`VALID`, `EXPIRING_SOON ≤ 30d`, `EXPIRED`, `MISSING`, `NO_EXPIRY`).
- **Turnstile Gate Access Interlock:** Real-time site clearance status (`CLEARED` vs `BARRED`). Turnstile access is automatically locked for workers with expired or unverified mandatory safety credentials.
- **Safety Inspections & Checklists:** Digital execution for Working at Heights/Scaffolding, Crane Lifting Plans, and Deep Excavation Shoring with Pass, Fail, and N/A checkpoints.
- **Automated Corrective Actions (CAPA):** Any failed inspection checkpoint instantly generates a tracked corrective action with priority, due date, and responsible engineer.
- **Official Compliance Reports & Exports:** Generates audit-ready registers, Employee Training Matrices, inspection logs, and instant CSV/Print/PDF exports.
- **Multi-Tenant Isolation & Role-Based Access:** Enforces strict Row Level Security (RLS) for 3 roles:
  - **Owner:** Full corporate governance, subscription, users, project sites, and audit logs.
  - **Manager:** Workforce onboarding, certificate renewal management, inspection execution, and reports.
  - **Viewer:** Read-only access for third-party client auditors (NEOM, Aramco, Bechtel) and external inspectors.
- **Dual-Mode Data Engine:** Operates with live Supabase PostgreSQL & Auth, with seamless, reactive local in-memory/localStorage store fallback for standalone demos and evaluation.

---

## 2. Technology Architecture

| Layer | Technologies | Description |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Modern SPA with strict TypeScript typing across all entities |
| **Styling & Design System** | Tailwind CSS, Lucide Icons | Custom palette (Navy `#16324F`, Teal `#168C82`, Amber `#F2B544`, Danger `#C83E4D`, Slate `#F5F7FA`) |
| **Bilingual Localization** | Custom React i18n Context | Genuine bi-directional RTL/LTR layouts, Arabic typography (`IBM Plex Sans Arabic`), English (`Inter`), timezone `Asia/Riyadh` |
| **Database & Auth** | Supabase (PostgreSQL 15), Auth, RLS | 13 normalized tables, triggers, helper security functions, and 100% RLS tenant isolation |
| **Storage & Security** | Private Supabase Storage | Short-lived signed download URLs (15-min expiry); zero public URLs for sensitive worker IDs |
| **Mobile Application** | Flutter & Dart / Web Simulator | Built-in Mobile Phone Simulator (393×852) and complete native Flutter blueprint (`FLUTTER_IMPLEMENTATION.md`) |

---

## 3. Transparency: Live vs Staging / Mock Service Matrix

In strict adherence to engineering integrity, the platform clearly badges every integrated service:

| Feature / Service | Status | Live Reality vs Prototype Details |
|---|---|---|
| **Database Storage & Schema** | **Production Ready** | Full PostgreSQL schema in `supabase/migrations/` with RLS policies, triggers, and indices. Dual-mode client connects to Supabase or reactive local store. |
| **Authentication & RLS** | **Production Ready** | Supabase Auth integrated. Interactive Role Switcher sandbox allows instant testing of Owner, Manager, and Viewer permissions. |
| **Dynamic Certificate Engine** | **Live Business Logic** | Calculated on the fly using `date-fns` difference in days against `Asia/Riyadh` business day (no manual status overrides). |
| **Turnstile Gate Clearance** | **Live Business Logic** | Evaluates active workforce against mandatory certification expiry dates; locks out workers instantly if expired. |
| **WhatsApp Direct Alerts** | **Live Deep-Link Intent** | Generates pre-formatted Arabic/English compliance reminder links via `https://api.whatsapp.com/send`. |
| **Document Storage** | **Production Ready** | Private bucket `contractor-docs` with folder-scoped RLS policies (`<company_id>/...`) and 15-minute signed URLs. |
| **Qiwa & Muqeem Integrations** | **Staging Indicator** | Displays realistic Saudi government integration status badges; real API gateway requires Ministry authorization credentials. |
| **Subscription Billing** | **Sandbox Staging** | Honest placeholder billing modal as specified. No simulated false payments; preserves trial/enterprise backend limits. |

---

## 4. Getting Started & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or pnpm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run automated multi-tenant and RLS security test suite
node scripts/test-cross-company-security.js

# 3. Start Vite development server
npm run dev

# 4. Build optimized production bundle
npm run build

# 5. Preview production bundle
npm run preview
```

The application will be available at `http://localhost:5173`.

---

## 5. Environment Variables & Supabase Setup

Configure your environment variables in `.env` (derived from `.env.example`):

```env
# Supabase Project URL (Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Public Anonymous API Key (Safe for client browsers)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Business Timezone & Locale
VITE_DEFAULT_TIMEZONE=Asia/Riyadh
VITE_DEFAULT_LOCALE=en
```

> [!CAUTION]
> **CRITICAL SECURITY RULE:** Never expose or configure `SUPABASE_SERVICE_ROLE_KEY` in frontend code, client bundles, or `.env`. The service-role key bypasses Row Level Security. All client requests in SiteReady GCC use `VITE_SUPABASE_ANON_KEY` along with authenticated JWT tokens to guarantee strict tenant isolation.

---

## 6. Database Migrations & SQL Architecture

SiteReady GCC provides a complete, reproducible migration pipeline in `supabase/migrations/`:

```
supabase/migrations/
├── 20241029000000_siteready_schema.sql           # Core 13 normalized tables, types, indexes, and base RLS
├── 20241029000001_storage_and_auth_triggers.sql   # Private storage bucket, folder RLS & atomic onboarding RPC
├── 20241029000002_audit_and_reminder_cron.sql     # Automated audit trail triggers & reminder job scheduler
└── 20241029000003_seed_demo_data.sql              # Multi-tenant verification seed data (Company A vs Company B)
```

### Applying Migrations to Supabase:
**Option A: Via Supabase CLI**
```bash
supabase db push
```

**Option B: Via Supabase Web Dashboard**
Open your Supabase project dashboard -> **SQL Editor**, and execute the migration files sequentially in numerical order (`000`, `001`, `002`, `003`).

### Database Permissions & RLS Policy Summary:
| Table | SELECT Permission | INSERT / UPDATE Permission | DELETE Permission |
|---|---|---|---|
| `companies` | Active company members | Only `owner` | Cascade / Restricted |
| `company_members` | Active company members | Only `owner` | Only `owner` |
| `profiles` | Own user profile (`id = auth.uid()`) | Own user profile | Own user profile |
| `sites` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `employees` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `certificate_types` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `employee_certificates` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `inspections` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `inspection_items` | Active company members (via inspection) | `owner` & `manager` | `owner` & `manager` |
| `corrective_actions` | Active company members | `owner` & `manager` | `owner` & `manager` |
| `subscriptions` | Active company members | Only `owner` | Restricted |
| `reminder_jobs` | Active company members | System cron / scheduler | System |
| `audit_events` | Active company members | Trigger-only (`SECURITY DEFINER`) | Immutable |
| `storage.objects` (`contractor-docs`) | Active company members matching folder UUID | `owner` & `manager` matching folder UUID | `owner` & `manager` matching folder UUID |

---

## 7. Automated Security & Cross-Company Verification

The repository includes an automated verification test runner (`scripts/test-cross-company-security.js`) that tests 52 critical assertions:
- **Tenant Isolation:** Verifies that Company A users can never read, modify, or leak Company B records.
- **Role Permission Enforcement:** Confirms that Viewers cannot execute any mutation, Managers can manage records but not corporate subscriptions or owners, and Owners possess full governance.
- **Private Storage Rules:** Validates path-based scoping (`<company_id>/<folder>/<file>`) and confirms cross-company download rejection.
- **Frontend Secret Audit:** Recursively scans `src/` to prove 0 occurrences of service-role keys.
- **Dynamic Expiry Calculation:** Tests date boundary conditions for turnstile interlock.

To execute the test suite:
```bash
node scripts/test-cross-company-security.js
```
*(Result: 52/52 tests passing)*

---

## 8. Mobile & Field Experience

The web application includes a **Device View Switcher** in the top utility bar:
- **Desktop Web View:** Full expanded left sidebar (240px), horizontal KPI strips, multi-select data tables, and print-ready reports.
- **Mobile Simulator (Android / Flutter view):** Simulates a 393×852 mobile phone screen with compact top bar, turnstile lockout alerts, 2-column KPI grid, swipeable audit lists, and a 5-tab bottom navigation bar (`Home`, `Workforce`, `Certs`, `Audits`, `More Hub`).

For compiling the native Android APK using Flutter, refer to the step-by-step engineering spec in [`FLUTTER_IMPLEMENTATION.md`](./FLUTTER_IMPLEMENTATION.md).

---

## 9. Compliance with GCC & Saudi Standards
- **Saudi Personal Data Protection Law (PDPL):** Data isolation by company, private storage for personal identity cards (Iqama/National ID), and audit trail logging.
- **Saudi Aramco Safety Standards:** Color-coded monthly rigging inspections, certified rigger categories, Scafftag verification.
- **NEOM & Red Sea Global Contractor Requirements:** Turnstile gate RFID interlock, mandatory third-party equipment certs, and bilingual daily inspection logs.
- **Timezone:** Fixed business timezone `Asia/Riyadh` (GMT+3) for regulatory expiration calculations.
