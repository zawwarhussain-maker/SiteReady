---
name: SiteReady GCC Compliance System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#466080'
  primary: '#001d37'
  on-primary: '#ffffff'
  primary-container: '#16324f'
  on-primary-container: '#809abd'
  inverse-primary: '#aec9ed'
  secondary: '#006a62'
  on-secondary: '#ffffff'
  secondary-container: '#90f4e8'
  on-secondary-container: '#007168'
  tertiary: '#281900'
  on-tertiary: '#ffffff'
  tertiary-container: '#422c00'
  on-tertiary-container: '#c68e1d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#aec9ed'
  on-primary-fixed: '#001d37'
  on-primary-fixed-variant: '#2e4867'
  secondary-fixed: '#90f4e8'
  secondary-fixed-dim: '#73d7cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdeab'
  tertiary-fixed-dim: '#fabc4a'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an enterprise-grade operational compliance environment engineered specifically for industrial sites, civil works, and mega-projects across the Gulf Cooperation Council (GCC). The interface conveys regulatory authority, unwavering dependability, and audit-level clarity. It eliminates cosmetic ambiguity in favor of deterministic status reporting.

The visual style is **Corporate / Modern** optimized for operational field integrity:
- **Tone:** Authoritative, methodical, vigilant, and structured.
- **Audience:** HSE managers, corporate compliance directors, sub-contractor liaisons, and field safety officers conducting active gate checks.
- **Bi-directional Symmetry:** Flawless balance across Left-to-Right (English) and Right-to-Left (Arabic) scripts, preserving precise hierarchical weight, tap clearances, and scanning velocity across both linguistic modes.
- **Aesthetic Tenets:** Dense yet breathable data presentation, crisp borders, subtle elevation tokens, and prominent semantic status signaling designed to prevent operational oversights under outdoor glare or high-velocity desk workflows.

## Colors

The color palette is calibrated for high-volume operational screening, regulatory verification, and risk stratification. Contrast levels meet or exceed WCAG AA specifications across all core text layers and interactive states.

### Core Roles
- **Primary (`#16324F`):** Deep Navy Blue. Used for foundational navigation structures, primary command buttons, modal headers, and dominant data anchor points.
- **Secondary / Success (`#168C82`):** Teal Green. Signifies certified status, compliant records, completed training validations, and active certifications.
- **Warning / Expiring (`#F2B544`):** Amber. Applied to impending expirations (within 30-day inspection windows), action-required badges, and cautionary alerts. Pair with `#172B3A` text for accessible contrast.
- **Critical / Overdue (`#C83E4D`):** Crimson Red. Highlights non-compliant contractors, site access bans, expired gate passes, and mandatory corrective actions.
- **Pending / Neutral Accent (`#475569`):** Slate. Denotes awaiting verification, draft submissions, or untracked profiles.

### Canvas & Surface Tokens
- **Background (`#F5F7FA`):** Low-strain, cool tinted gray canvas that isolates card elements cleanly under intense lighting conditions.
- **Surface / Cards (`#FFFFFF`):** Pure white container surfaces for standard records, summary widgets, and tabular grids.
- **Border Surface (`#E2E8F0`):** Crisp structural dividing lines used to bound complex tabular layouts without clutter.

### Typography Ink Roles
- **Main Text (`#172B3A`):** Ultra-dark navy-slate ensuring decisive readability for alphanumeric IDs, worker names, and certification IDs.
- **Secondary Text (`#64748B`):** Balanced mid-slate for metadata, labels, relative timestamps, and subheadings.
- **Disabled / Hint Text (`#94A3B8`):** Muted slate for inactive controls or placeholder hints.

## Typography

The type scale prioritizes numerical scanability, tabular clarity, and cross-linguistic parity. 

### Font Architecture
- **Latin Primary:** `Inter` handles English UI strings, technical IDs, and tabular datasets with tight optical tracking and tall x-height.
- **Arabic Primary:** `IBM Plex Sans Arabic` (fallback: `Noto Sans Arabic`) maps directly across all hierarchical weights (`400`, `500`, `600`, `700`). Its geometric balance and generous baseline-to-ascender ratios closely mirror the optical weight of Inter, maintaining identical button heights and card boundaries without layout shift during runtime locale switching.

### Behavioral Rules
- **Line Heights for RTL:** When Arabic is active, line heights for body and headline tokens expand automatically by an optical offset of 2px to 4px to accommodate extended Arabic ascenders and diacritical marks without clipping.
- **Numerical Formatting:** National ID cards (Iqama), unified GCC company numbers, and certificate serial numbers must always use tabular figures (`font-variant-numeric: tabular-nums`) to guarantee visual alignment across data tables and compact audit cards.

## Layout & Spacing

Layout geometry follows an exact 8pt spatial grid (with a 4pt half-grid for micro-adjustments such as chip padding and icon offsets).

### Layout Geometry
- **Desktop (1024px+):** Fixed 260px collapsible sidebar for operational views, paired with a 12-column fluid grid. Columns feature a `1.5rem` (24px) gutter with an outer canvas boundary margin of `2rem` (32px).
- **Tablet (768px – 1023px):** 8-column layout with `1rem` (16px) gutters and `1.5rem` (24px) margins. Tables degrade into multi-line list cards or scrollable horizontal sheets.
- **Mobile (< 768px):** Single-column stacked layout with `0.75rem` (12px) gutters and `1rem` (16px) margins. Minimum touch targets across all mobile views are enforced at 44px x 44px to accommodate gloved or field-level terminal use.

### Spacing Tokens Application
- `space-xs` (4px): Chip horizontal spacing, icon-to-label inline gaps.
- `space-sm` (8px): Stacked field label to input element, compact badge internal padding, micro-card list separation.
- `space-md` (16px): Standard form element vertical rhythms, table cell padding, card internal gutter gaps.
- `space-lg` (24px): Card container internal padding, sectional header baselines.
- `space-xl` (32px): Dashboard module separation, major section breaks.

## Elevation & Depth

This design system uses a utilitarian, low-depth approach centered on crisp structural outlines and low-opacity ambient shadows. Strong elevations are rejected in favor of high-contrast perimeter boundaries (`#E2E8F0`) that maintain high legibility on mobile hardware outdoors.

### Elevation Levels
- **Level 0 (Flat / Canvas):** Applied to the main page background (`#F5F7FA`). No shadow. Borderless.
- **Level 1 (Card & Row Surface):** Default card state. Pure white fill (`#FFFFFF`), enclosed in a 1px solid border (`#E2E8F0`), supported by an ultra-subtle ambient shadow: `0px 1px 3px rgba(22, 50, 79, 0.05)`.
- **Level 2 (Hover / Active Record / Flyout):** Interactive list items, hover states on cards, and contextual action menus. Border transitions to `#CBD5E1` with shadow: `0px 4px 12px -2px rgba(22, 50, 79, 0.08)`.
- **Level 3 (Modal / Field Verification Drawer):** Off-canvas slide-out panels and gate-check inspection dialogs. Shadow: `0px 12px 32px -4px rgba(22, 50, 79, 0.16)`. Combined with a backdrop scrim of `#16324F` at 40% opacity.

## Shapes

The design system adopts a disciplined, enterprise-level shape language (`roundedness: 1`). Core component corners maintain an 8px radius (`0.5rem` / `rounded-lg`), delivering structural geometry that feels balanced, modern, and reliable without becoming frivolous.

### Corner Radii Guidelines
- **Input Fields, Dropdowns, and Standard Buttons:** `0.5rem` (8px). Ensures crisp visual anchoring alongside data cells.
- **Cards, Modals, and Dashboard Containers:** `0.5rem` (8px) to `0.75rem` (12px / `rounded-xl`).
- **Status Badges & Compliance Chips:** `0.25rem` (4px / `rounded`) for strict industrial rectangular tags, or fully curved pill-shapes strictly reserved for gate pass validation status indicators.
- **Form Controls (Checkboxes):** `0.25rem` (4px) soft rounding.

## Components

### Buttons
- **Primary:** Background `#16324F`, text `#FFFFFF`, border none, 8px radius. Hover: `#10243A`. Active: `#0B1928`. Height: 40px (desktop), 48px (mobile field mode).
- **Secondary (Operational):** Background `#168C82`, text `#FFFFFF`. Used for positive actions such as "Approve Iqama", "Validate Gate Pass", and "Submit Training Certificate".
- **Outline / Neutral:** Background `#FFFFFF`, border 1px solid `#E2E8F0`, text `#172B3A`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Destructive:** Background `#FFFFFF`, border 1px solid `#C83E4D`, text `#C83E4D`. Hover: background `#FDF2F2`.

### Status Badges & Chips
Status communication is critical. Badges must combine a 2px vertical indicator bar or colored lead icon alongside high-contrast semantic fills:
- **Compliant / Active:** Background `#E6F4F2`, text `#0E615A`, border 1px solid `#B3E0DC`.
- **Expiring Soon (30d):** Background `#FEF8EC`, text `#946300`, border 1px solid `#FCE2A6`.
- **Overdue / Expired / Barred:** Background `#FDF2F3`, text `#9C222F`, border 1px solid `#F7B5BC`.
- **Pending Review:** Background `#F1F5F9`, text `#475569`, border 1px solid `#CBD5E1`.

### Data Cards (Compact Compliance View)
- White container (`#FFFFFF`), 1px border (`#E2E8F0`), 8px to 12px radius, `1rem` (16px) internal padding.
- Divided into three visual zones: Worker/Subcontractor Identity (with photo avatar and national ID tag), Status Badge Block, and an inline audit trail footer (expiry dates and verification actions).

### Input Fields & Selectors
- Height 40px, 8px radius, border 1px solid `#CBD5E1`, background `#FFFFFF`, text `#172B3A`, placeholder `#94A3B8`.
- Focus state: border 1px solid `#16324F`, ring outline `3px solid rgba(22, 50, 79, 0.12)`.
- RTL adjustments: leading and trailing icons swap positions natively; prefix text (such as `+966` or `CR#`) pins strictly to the physical start of the control.

### Tables & Audit Logs
- Header: `#F8FAFC` background, text `#64748B`, font-size 12px, font-weight 600, uppercase letter-spacing +0.05em.
- Row: Height 52px, bottom border 1px solid `#E2E8F0`. Hover row state: `#F8FAFC`.
- Mono-aligned verification hashes, certificate numbers, and expiry counters (`days remaining`) aligned consistently to the reading end of the column.

### Bilingual Locale Switcher
- Compact segmental control pinned to global navigation. Shows `EN` and `العربية` with active segment filled in `#16324F` (white text) and inactive segment transparent (`#64748B` text). Transition across locales switches document `dir` attribute smoothly between `ltr` and `rtl` with zero layout shift.