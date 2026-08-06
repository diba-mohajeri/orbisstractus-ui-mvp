# BuildSphere — Modular React Rebuild Plan

## Context

`BuildSphere-SaaS-Master-13-Enterprise-Portfolio-Command-Center.html` is a single 1.8MB static HTML file — the accumulated output of 13 additive "Master" prompts, each bolting one more capability onto a vanilla-JS/CSS demo with no build step, no components, no backend, and no router (view switching is `display:none` toggling driven by ~160 global JS functions). It currently covers two audiences sharing one login: the **BuildSphere Partner Network** (client portal, 18 views) and **InsightX** (internal execution workspace, 8 screens).

The repo also contains 27 wireframe docs (`WF_*.md`) that are the actual design spec — each documents a page's states, widgets, interaction flow, accessibility notes, and (critically) a **Production Gaps** table listing exactly what's fake/unwired in the current demo and what a real build should do instead (working filters, real drill-downs, enforced governance gates, a canonical dataset, etc.).

Goal: rebuild this as a modular React app, page by page, following the wireframes as the spec — not the legacy HTML as the spec. Per your answers:
- **Stack**: Vite + React + TypeScript
- **Styling**: MUI (Material UI), themed to match the existing token palette (navy/blue/green/amber/red) — not a 1:1 CSS port
- **Scope**: build toward each wireframe's **Production Gaps** recommendations (real filters, drill-downs, enforced gates), not a faithful bug-for-bug demo port — this requires defining API contracts up front, fulfilled by a mock layer so the app is written exactly as it will run against a real backend later

This is a large, multi-page rebuild. The plan below sequences it page-by-page (matching how you asked to work), after a foundation phase that only needs to happen once.

---

## Confirmed page inventory (authoritative — from WF_A2 and WF_C1's nav tables, cross-checked against the HTML's `showClientView()`/`showScreen()` call sites)

**Pre-auth**: WF_A1_Sign_In_BuildSphere.md — shared login, audience tabs (Client / InsightX Employee), employee role dropdown selects landing screen.

**Client Portal** (`/portal/*`, 18 views incl. home): WF_A2 (home/shell) + WF_B1–WF_B17 (Portfolio Hub, Portfolio & Asset Management, Digital Twin Hub, Predictive Analytics & Benchmarking, Enterprise Portfolio Command Center, Project Center, Report Center, Deficiency Center, Action & Remediation, Capital Planning, Asset Registry, Document Vault, Board Reporting, AI Building Advisor, Communication Center, Undergoing Assessments, Request Assessment).

**InsightX workspace** (`/insightx/*`, 8 screens): WF_C1–WF_C8 (Overview, PM/Intake, Inspector, Analyst, Report+QA/P.Eng., Delivery, Embedded Report Viewer [programmatic-only, shared with client portal preview], Administration [12 sub-views alone]).

`WF_A1_Sign_In.md` (the "FUSION CEM" file) is a different, unrelated product left in this directory — out of scope, not touched.

---

## Architecture

### Project structure

```
src/
  app/                        # root App, providers (Query, Theme, Router), error boundary
  theme/                      # MUI theme.ts — palette/typography/component overrides ported from :root tokens
  shared/
    components/               # cross-page reusable widgets (catalog below)
    hooks/                    # useEntityScope, useBreadcrumb, useGovernanceGate, etc.
  domain/                     # TypeScript types for the canonical data model (Building, Deficiency, Finding, ...)
  api/
    contracts/                # per-resource request/response types + endpoint docs (mirrors wireframes' "API Bindings" tables)
    client.ts                 # fetch wrapper
  mocks/                      # MSW handlers + seed fixtures — ONE relational dataset, not per-page hardcoded numbers
  features/
    auth/                                  # WF_A1
    client-portal/
      shell/                               # WF_A2 persistent chrome: header, 18-item nav, breadcrumb
      home/                                # WF_A2 content
      portfolio-hub/                       # WF_B1
      asset-management/                    # WF_B2
      digital-twin/                        # WF_B3
      predictive-analytics/                # WF_B4
      enterprise-command/                  # WF_B5
      project-center/                      # WF_B6
      report-center/                       # WF_B7
      deficiency-center/                   # WF_B8
      action-remediation/                  # WF_B9
      capital-planning/                    # WF_B10
      asset-registry/                      # WF_B11
      document-vault/                      # WF_B12
      board-reporting/                     # WF_B13
      ai-advisor/                          # WF_B14
      communication-center/                # WF_B15
      undergoing-assessments/              # WF_B16
      request-assessment/                  # WF_B17
    insightx/
      shell/                               # WF_C1 persistent chrome: header, sidebar nav
      overview/                            # WF_C1
      pm-intake/                           # WF_C2
      inspector/                           # WF_C3
      analyst/                             # WF_C4
      report-qa/                           # WF_C5
      delivery/                            # WF_C6
      administration/                      # WF_C8 (12 nested sub-routes)
    report-viewer/                         # WF_C7 — shared between insightx (C6→preview/final) and client portal (B11/B16 drill-down)
  routes.tsx
```

Each `features/**` folder is self-contained: `<Page>.tsx`, `api.ts` (React Query hooks for that feature), `components/` (page-local widgets not reused elsewhere). Anything a second page needs gets promoted to `shared/components`.

### Routing (React Router v6, real URLs — replacing `showClientView`/`showScreen` string dispatch)

- `/login`
- `/portal` (home) · `/portal/portfolio-hub` · `/portal/asset-management/:buildingId?` · `/portal/digital-twin/:buildingId?` · `/portal/predictive-analytics` · `/portal/enterprise-command` · `/portal/projects` · `/portal/reports` · `/portal/deficiencies` · `/portal/actions` · `/portal/capital-planning` · `/portal/asset-registry/:assetId?` · `/portal/documents` · `/portal/board-reporting` · `/portal/ai-advisor` · `/portal/communications` · `/portal/undergoing-assessments/:projectId?` · `/portal/request-assessment`
- `/insightx` (overview) · `/insightx/intake` · `/insightx/inspector` · `/insightx/analysis` · `/insightx/report-qa` · `/insightx/delivery` · `/insightx/admin/:subview`
- `/report-viewer/:reportId?mode=preview|final` — used as a real route so it's linkable/back-button-able, not a screen-swap

Optional `:id` params replace the current "selector card looks clickable but does nothing" pattern (WF_B3's Building Twin Selector, WF_B11/B16's master-detail lists) with real navigation that actually scopes the page.

The `ClientPortalShell` and `InsightXShell` layouts own the nav + breadcrumb/back-button, computed from the route (`useMatches()`/route handles), not a manually maintained string map.

### Theming

`theme/theme.ts` maps the existing tokens onto MUI's palette:

| Legacy token | MUI slot |
|---|---|
| `--navy #0b1f3a` | `palette.text.primary`, `primary.dark` |
| `--blue #1f5fab` | `palette.primary.main` |
| `--green #0f8a5f` | `palette.success.main` |
| `--amber #b7791f` | `palette.warning.main` |
| `--red #b42318` | `palette.error.main` |
| `--bg #f4f7fb` | `palette.background.default` |
| `--line #d8e1ec` | `palette.divider` |
| `--shadow` | custom `shadows[1]` override |

Component overrides (`theme.components`) recreate the wireframes' visual language on top of MUI primitives: rounded `MuiCard` (20–28px radius + soft shadow), bold pill `MuiChip` for every status badge (`.badge`/`.status-select`), `MuiTabs` for `.tabs`, `MuiDrawer anchor="right"` for the Technical Layer drawer, `MuiDialog` for the QA/Delivery/Demo modals, `MuiLinearProgress` for `.progress`/score bars, `MuiAlert` for `.alert` variants (amber/green/red).

### Data layer — built toward the Production Gaps, not the demo's hardcoded numbers

1. **`domain/`** — one canonical TypeScript model (Portfolio → Region → Building → System → Component → Asset; Deficiency, Finding, Observation, Project, Report, CapitalPlanItem, Action, Document, Message, User/Role, AuditEvent). This resolves the dataset mismatch the wireframe review flagged repeatedly (WF_B5's 84 buildings/5 regions vs. WF_B1/B2's 24 buildings/3 regions) — every KPI/rollup is *computed* from this one dataset, never a second hardcoded number.
2. **`api/contracts/`** — typed request/response shapes per resource, filter/sort/paginate query params included, documented like the wireframes' own "API Bindings" tables.
3. **`mocks/`** — MSW request handlers implementing those contracts against seed fixtures. The app calls real `fetch`/React Query against these — swapping MSW for a live backend later is a config change, not a rewrite.
4. **`features/*/api.ts`** — TanStack Query hooks per feature (`usePortfolioSummary`, `useAssetRegister(filters)`, `useBuildingTwin(buildingId)`, …), each with real loading/empty/error UI (every wireframe explicitly notes "no loading/error state exists" as a gap).
5. **Global UI state** (drawer open/content-key, QA-check overlay, active entity scope) via a small Zustand store — kept separate from server state.

### Cross-cutting fixes applied globally (called out repeatedly across the wireframe reviews, fixed once instead of per-page)

- Selector cards that currently do nothing (WF_B3 Building Twin Selector, WF_B4/B5 scope selectors) become real state/route-driven scoping via a shared `EntitySelector`.
- KPI tiles that look like filters but aren't (WF_B1, WF_B8) become real clickable filters via `KpiStrip`.
- Master-detail views with partial wiring bugs (WF_B11 Asset Registry, WF_B16 Undergoing Assessments) get one real `MasterDetailPanel` that fully re-renders on selection.
- Governance gates that are decorative today become enforced: QA flags block P.Eng. seal (WF_C5), high-risk QA blocks Final PDF release (WF_C6/C7), scope handoff requires Inspector sign-off (WF_C2→C3).
- Large tables (WF_B2's 1,248-row register, WF_C8 Audit Trail) get real search/sort/filter/pagination via one `DataTable` (MUI X DataGrid).
- Clickable cards become real `<button>`/`<Link>` elements (WF_A2 flagged the current `<div onclick>` cards as not keyboard-accessible).
- Duplicate near-identical CSS components (`pred12-card` vs `cmd13-region-card` in WF_B4/B5) collapse into one `ScoreCard`.
- InsightX gets a real (if minimal) project switcher instead of the hardcoded "Maple Towers" (WF_C1).

### Shared component catalog (build once in `shared/components`, consumed by most pages)

`HeroBanner`, `KpiStrip` (filterable), `DataTable` (MUI X DataGrid wrapper w/ badge-cell renderers), `ScoreCard`/`ScoreBar`, `SeverityTierRow`/`SeverityMatrix`, `LineageFlow`/`ProcessFlow`, `AIDisclaimerBanner`, `EntitySelector`, `PriorityTable`, `MilestoneStepper` (MUI `Stepper`, replaces flat milestone tables per WF_B16's own recommendation), `OptionCardToggle`, `GovernanceRulesTable`, `AccessLevelBadge`, `PermissionMatrix`, `RowActionButton`, `SectionedFormTable` (WF_C4's Deficiency Builder), `TraceBox` (WF_C5 source-chain reveal), `ObservationCard` (WF_C3), `ReportSectionChecklist` (WF_C5), `MasterDetailPanel`, `TechnicalLayerDrawer`, `QaCheckOverlay`, and a print-oriented family (`OpeFindingCard`, `ReportPrintArea`) for the Embedded Report Viewer.

---

## Delivery phases (page-by-page)

**Phase 0 — Foundation.** Scaffold Vite/React/TS; install MUI, React Router, TanStack Query, MSW, Zustand; build `theme/theme.ts`; stand up `domain/` model + one seed dataset + MSW handlers for it; build the first few `shared/components` (`HeroBanner`, `KpiStrip`, `DataTable`); build both empty shells (`ClientPortalShell`, `InsightXShell`) with working nav/breadcrumb and the routing tree; implement `/login` (WF_A1).

**Phase 1** — `/portal` home (WF_A2): real KPI strip + 16→17 hub cards (fix the missing Undergoing Assessments card), keyboard-accessible.

**Phase 2 — Asset intelligence trio** (share `EntitySelector`): Portfolio Hub (B1), Portfolio & Asset Management (B2), Digital Twin Hub (B3 — wires the Building Twin Selector for real).

**Phase 3 — Intelligence layer** (share `ScoreCard`/`SeverityMatrix`): Predictive Analytics & Benchmarking (B4), Enterprise Portfolio Command Center (B5 — real Scenario Modeling compare flow).

**Phase 4 — Operational hubs**: Project Center (B6), Report Center (B7), Deficiency Center (B8 — clickable KPI filters), Action & Remediation (B9).

**Phase 5 — Planning & governance**: Capital Planning (B10), Asset Registry (B11 — fixes master-detail wiring bug), Document Vault (B12), Board Reporting (B13).

**Phase 6 — Engagement**: AI Building Advisor (B14), Communication Center (B15 — real "Ask Question" compose flow), Undergoing Assessments (B16 — fixes master-detail wiring bug), Request Assessment (B17 — real form + submit flow).

**Phase 7 — InsightX shell + early pipeline**: shell chrome + nav (C1), Overview (C1 content), PM/Intake (C2), Inspector (C3 — `ObservationCard`).

**Phase 8 — InsightX late pipeline**: Analyst (C4 — `SectionedFormTable`), Report+QA/P.Eng. (C5 — enforced seal gate, `TraceBox`), Delivery (C6 — enforced release gate), Embedded Report Viewer (C7, shared route consumed by both C6 and B11/B16).

**Phase 9 — Administration (C8)**: largest single page (12 sub-views) — its own phase: Control Center/Dashboard, Organizations, Users, Roles & Permissions, Workflow Configuration, Report Configuration, Governance & Release Engine, Audit Trail (real filter/search), Subscription Management, API & Integrations, AI & Automation Hub.

**Phase 10 — Cross-cutting polish**: accessibility pass, responsive breakpoints, final canonical-dataset consistency audit across all pages, smoke tests.

---

## Verification

- Each phase: `npm run dev`, click through the phase's page(s) against its wireframe's ASCII states and confirm the Production Gaps items for that page are actually fixed (not just visually present).
- Component tests (Vitest + React Testing Library) for `shared/components` as they're built.
- A handful of Playwright smoke flows once routing is stable: login → portal home → drill into a building (Digital Twin) → back; InsightX login → Intake → Inspector → Analyst → Report+QA → Delivery happy path.
- `mcp__ide__getDiagnostics` / `tsc --noEmit` kept clean throughout given the TypeScript strictness this scope needs.
