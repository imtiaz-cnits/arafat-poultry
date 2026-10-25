# Arafat Poultry & Fisheries - Project Rules & Agent Instructions
## Architecture, Brand Standards & Business Scope

> [!IMPORTANT]
> This document specifies strict architectural, styling, branding, and behavioral rules for all AI agents and developers working on the **Arafat Poultry & Fisheries Management System & POS**.
> Unrelated functionality, existing database schemas, models, migrations, or application logic must NEVER be changed without explicit authorization.

---

### 1. Project Identity & Verified Tech Stack [STRICT]
1. **Business Name**: Arafat Poultry & Fisheries
2. **Tagline**: Quality Products. Trusted Service.
3. **Repository**: `https://github.com/imtiaz-cnits/arafat-poultry`
4. **Project Structure (NO `src` FOLDER)**:
   - The project root directly contains `app/`, `components/`, `lib/`, `prisma/`, `public/`, etc.
   - Under no circumstances should a `src/` directory be created or used.
5. **Verified Engine & Frameworks**:
   - **Framework**: Next.js 16+ (App Router with Turbopack)
   - **Language**: TypeScript (`tsconfig.json` with strict mode and `@/*` path aliases)
   - **ORM**: Prisma ORM (`prisma/schema.prisma`)
   - **Database**: MySQL 8+ (connecting via `DATABASE_URL` in `.env`)
   - **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`, `@import "tailwindcss";` in `app/globals.css`)
   - **Icons**: Lucide React (`lucide-react`)
   - **State**: Zustand (`zustand`)
   - **Auth**: JWT (`jsonwebtoken`) & Bcrypt (`bcryptjs`)
6. **Verified Development & Verification Commands**:
   - `npm run dev` : Starts Next.js development server with Turbopack (`http://localhost:3000`)
   - `npm run build` : Builds production bundle and runs strict type-checks
   - `npm run start` : Launches production server
   - `npm run lint` : Runs ESLint verification
   - `npx prisma generate` : Generates Prisma client types

---

### 2. Exact Logo File Mapping & Favicon Integration [STRICT]
All three official brand image assets are located directly in the `public/` directory:

1. **Main Application Logo (`logo1.png`)**:
   - **File Path**: `/logo1.png` (`public/logo1.png`)
   - **Locations Used**:
     - Dashboard sidebar header branding (`components/sidebar.tsx`)
     - Main topbar header branding (`components/topbar.tsx`)
     - Cash sales thermal receipt header (`components/pos/thermal-receipt.tsx`)
     - Delivery challan print header (`components/challan/challan-print-receipt.tsx`)
     - Sales invoice detail & print header (`app/(dashboard)/invoices/[id]/page.tsx`)
     - Purchase invoice detail & print header (`app/(dashboard)/purchases/[id]/page.tsx`)
     - Goods received voucher modal header (`app/(dashboard)/purchases/page.tsx`)
     - Purchase return voucher header (`app/(dashboard)/purchase-returns/page.tsx`)
     - Customer return voucher header (`app/(dashboard)/returns/page.tsx`)
   - *Rule*: Never substitute `logo2.png` into the main application or dashboard areas.

2. **Authentication Logo (`logo2.png`)**:
   - **File Path**: `/logo2.png` (`public/logo2.png`)
   - **Locations Used**:
     - Login page desktop hero branding (`app/login/page.tsx`)
     - Login page mobile responsive header (`app/login/page.tsx`)
     - Any future dedicated customer/staff authentication or registration screens.
   - *Rule*: Dedicated strictly to authentication screens; do not replace dashboard logos with `logo2.png`.

3. **Application Favicon (`fav-icon.png`)**:
   - **File Path**: `/fav-icon.png` (`public/fav-icon.png`)
   - **Locations Used**:
     - Browser favicon and tab icon via `app/layout.tsx` metadata `icons` and `<head>` links.
     - Apple touch icon link in `app/layout.tsx`.
   - *Rule*: Do not substitute `logo1.png` or `logo2.png` for `fav-icon.png`. Obsolete `favicon.ico` in `app/` is removed to prevent Next.js from conflicting with `/fav-icon.png`.

---

### 3. Brand Color Palette & Design Tokens [STRICT]

| Purpose | Name | Hex Code | Tailwind / CSS Token |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Forest Green | `#166534` | `--color-primary: #166534`, `emerald-800` / `green-800` |
| **Secondary** | Aqua Blue | `#0284C7` | `--color-secondary: #0284c7`, `sky-600` |
| **Accent** | Harvest Orange | `#EA580C` | `--color-accent: #ea580c`, `orange-600` |
| **Background** | Soft White | `#F8FAFC` | `--background: #f8fafc`, `slate-50` |
| **Text** | Slate Charcoal | `#1F2937` | `--foreground: #1f2937`, `gray-800` |

#### Styling Guidelines:
1. **Dominant Palette**:
   - **Green** is the primary brand color across sidebar, topbar, primary action buttons, table headers, and modal headers.
   - **Blue** is the secondary brand color for secondary badges, filters, indicators, and user avatars.
   - **Orange** is a limited accent reserved for special highlights, badges, held/pending tags, and attention counters.
2. **Preserve Semantic Status Colors**:
   - Do NOT overwrite semantic colors. Danger/Delete actions must remain Red (`#dc2626`), Success remains Emerald/Green (`#16a34a`), and Warning remains Amber (`#d97706`).
3. **Dark Mode Tokens**:
   - Background: `#0b0f19`
   - Card / Modal Background: `#0f172a` (`slate-900`)
   - Input / Control Background: `#1e293b` (`slate-800/90`)
   - Border Colors: Light mode `#cbd5e1`, Dark mode `#334155`
4. **Typography Standards**:
   - English & Numeric: **`Valley Sans`** (`sans-serif`)
   - Bangla Text: **`Baloo Da 2`** (`sans-serif`)

---

### 4. POS Architecture & Operational Standards [STRICT]
1. **POS 100vh Full Screen Rule**:
   - The POS screen (`/pos`) must fill `100vh` without page scrolling.
   - Cart item list must scroll independently (`overflow-y: auto`) with a sticky header.
   - Payment buttons, checkout actions, discount controls, and totals must remain pinned at the bottom.
2. **Barcode Scanning**:
   - Support both physical USB barcode scanner guns (keypress buffer) and Camera scanning (`html5-qrcode`).
   - Support multi-barcode lookup against product code arrays.
3. **Data Ordering Standards**:
   - All list queries and backend APIs must sort descending: `orderBy: { id: 'desc' }`.
   - Post-creation state updates must reset pagination to page 1 (`page = 1`).
4. **Currency Formatting**:
   - All monetary figures must use Bangladeshi comma formatting via `formatBdCurrency()` (e.g. `৳ 24,800.00`).

---

### 5. Layout & Modal Component Dimensions
1. **Header & Top Actions**:
   - Icon badge: `w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800`.
   - Page Title: Clean `h1` in bold text, no bottom margin, no clutter.
   - Action / Export buttons: Exactly `38px` height, rounded-xl.
2. **Form Controls & Modals**:
   - Form Inputs & Selects: Standard height `42px` (`height: 42px !important; width: 100% !important;`).
   - Unified Modal Container: `border-radius: 16px`, max height `90vh` or `95vh`, single container.
   - Modal Header: Deep Forest Green `#166534` gradient with circular red close button (`#dc2626`).
   - Sticky Footer: Cancel button (Red `#dc2626`), Submit/Save button (Deep Forest Green `#166534`).
3. **Sticky Page Footer**:
   - Full height wrapper: `.min-h-screen flex flex-col justify-between`.
   - Pinned at bottom: `© <Year> ARAFAT POULTRY & FISHERIES | Software By: CodeNext IT`.
   - Suppressed on `/pos` full-screen view.

---

### 6. Database & Transaction Safety Rules [CRITICAL]
1. **Strict Database Immutability for Rebranding**:
   - Do NOT drop, alter, rename, or truncate tables, columns, indexes, or constraints.
   - Do NOT create, apply, rewrite, or delete migrations.
   - Do NOT reset, seed, or delete database records.
   - Do NOT delete or modify SQL backups (`.sql` files).
   - Rebranding is purely UI/presentation and does not require database changes.
2. **Safe Transaction Protocol**:
   - Any future database modifications must use Prisma transactions (`prisma.$transaction`).
   - Inward stock adjustments must maintain referential integrity with inventory and ledgers.
   - Never commit `.env` credentials or secrets.

---

### 7. Future Business Scope Specification
*(Note: Documentation of scope only. Do NOT implement new business logic or database schemas without authorization.)*

#### A. Chicken Feed Management
The system will manage the chicken feed lifecycle:
1. **Feed Procurement & Purchases**:
   - Purchases from feed millers and distributors.
   - Product name, brand/manufacturer, bag size (e.g., 25kg, 50kg), units, quantities, and cost price per bag.
2. **Inventory Tracking**:
   - Stock received, sold, returned to supplier, damaged, and manual stock adjustments.
3. **Sales & Distribution**:
   - Customer sales, wholesale vs. retail pricing, bag discounts, and payment terms.
4. **Financial Ledgers & Reports**:
   - Customer dues and supplier outstanding balances.
   - Feed purchase, sales volume, stock valuation, and gross/net profitability reports.

#### B. Chicken Egg Sales
The system will manage egg production and commercial trade:
1. **Collection & Inward Stock**:
   - Eggs collected directly from own poultry sheds or purchased from external suppliers.
2. **Configurable Units**:
   - Configurable units including trays, pieces (hali/dozen), and cartons.
   - *Requirement*: Tray capacity must NOT be assumed constant (support 30-egg trays, 24-egg trays, etc.). Unit conversions must be fully configurable.
3. **Loss & Breakage Tracking**:
   - Record egg stock received, sold, broken/cracked during transit or storage, spoiled, returned, and adjusted.
4. **Commercial Sales & Reporting**:
   - Customer sales, tiered price per piece/tray, discounts, and payments.
   - Customer dues and supplier balances.
   - Date-wise egg sales, stock balance, breakage loss, and net profitability reports.

#### C. Fish Farming, Purchasing, and Sales
The system will manage aquaculture operations and fish trading:
1. **Fish Farming (Pond Operations)**:
   - Pond identification, size, depth, and farming location records.
   - Stocking records: fish species (Rohu, Catla, Pangas, Tilapia, etc.), stocking dates, fingerling counts, and fingerling purchase costs.
   - Feed consumption tracking (floating/sinking feed bags fed per pond).
   - Operational expenses: labor wages, medicines/chemicals, lime, aeration, pond maintenance, netting, and transportation.
   - Mortality tracking and partial/full harvest records.
   - Accurate computation of total production cost, cost per kilogram, harvest revenue, and net profit per pond cycle.
2. **Fish Purchasing & Stock Trading**:
   - Purchases from other fish farmers, suppliers, and local fish landing centers (arot).
   - Species, fish count, total weight in kg, purchase price per kg, icing/packaging, and direct haulage costs.
   - Stock management, spoilage/dead fish deduction, returns, and adjustments.
   - Supplier ledgers and payables.
3. **Fish Sales & Commercial Distribution**:
   - Sales by fish species, weight in kg, grade/size, selling price per kg, customer, and date.
   - Configurable units supporting kilogram-based precision weighing.
   - Delivery charges, customer discounts, immediate cash/bank payments, and dues.
   - Inward vs. sold fish reconciliation and live tank/holding inventory.
   - Comprehensive reports covering purchases, sales, farming costs, harvest yield, and overall profitability.

#### D. Shared Financial & Accounting Requirements
1. **Unified Ledgers**: Comprehensive customer and supplier ledgers with debit, credit, balance, and transaction history.
2. **Receivables & Payables**: Real-time tracking of partial payments, collections, aging dues, and supplier liabilities.
3. **Financial Calculations**: Mathematically consistent tax, discount, commission, delivery charge, and return adjustments.
4. **Audit Trail**: Complete date-wise transaction history, audit logs, and user activity records.
5. **Multi-dimensional Reporting**: Date-wise, product-wise, category-wise, customer-wise, and supplier-wise analytics.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
