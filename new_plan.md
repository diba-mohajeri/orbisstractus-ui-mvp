22# Executive full-access employee administration

## Context

The InsightX "Administration" console (`src/features/insightx/administration/`) already exists as a UI shell with 11 sub-views, but research confirmed it is **entirely static/mock display** — no real employee directory, no role-assignment mutation, no profile editing, and critically **no access control at all**: `RequireAuth` only checks `audience` (client vs. employee), never `role`, so today any signed-in employee — regardless of role — can navigate straight to `/insightx/admin` and the sidebar shows the Administration link to everyone.

There's also no concept of a specific privileged identity. Login is fully open (any email + password ≥4 chars succeeds), and since the login page's role dropdown was just removed, every employee session is hardcoded to `role: 'overview'` — there's currently no way to sign in as `admin` at all.

The user wants `executive@absi.com` specifically to get full administrative access: assign roles/access to other employees, monitor their work, and edit their profiles. Per the user's answers, scope is the ambitious end of what was offered: activity log **and** workload/assignment metrics for monitoring, support for **inviting** brand-new employees (not just managing a fixed seed set), and **real route-level gating** (not just hiding the nav link).

The cleanest way to grant `executive@absi.com` "full access" without reintroducing a client-side role picker (which was just deliberately removed) is to make role **identity-derived**: seed a mock employee directory, have the login mock handler resolve `role` server-side by looking up the signed-in email in that directory, and seed `executive@absi.com` in it with `role: 'admin'`. This also happens to close the "client dictates its own role" trust gap and makes "assign a role" in the new admin UI actually meaningful — changing someone's role in the directory changes what they get on their next login.

## Approach

### 1. Domain model — `src/domain/employees.ts` (new)
Add `Employee`, `EmployeeStatus` (`'active' | 'invited' | 'suspended'`), `EmployeeActivityEntry`, `EmployeeWorkloadSummary`. Reuse `EmployeeRole`/`EMPLOYEE_ROLE_OPTIONS` from the existing `src/domain/auth.ts` rather than duplicating. `Employee` fields: `id, name, email, role, status, title?, department?, phone?, createdAt, lastActiveAt?`.

### 2. Mock data/query layer — `src/mocks/data/employees.ts` (new)
Follow the existing mutable-in-memory-array pattern used by `src/mocks/data/portfolioQueries.ts` (see `createDeficiencyFromObservation`). Seed ~7 employees spanning every `EmployeeRole`, including:
- `executive@absi.com` → `role: 'admin'`, status active (the full-access account).
- A couple of employees whose `name` matches entries in `CONSULTANTS` in `src/mocks/data/portfolioData.ts` (`'M. Chen'`, `'J. Alvarez'`, etc. — already used as `Project.consultantLead`) so workload metrics have real, non-empty data to show.

Functions to export: `getEmployeeRows()`, `getEmployeeById(id)`, `findEmployeeByEmail(email)`, `updateEmployeeRole(id, role)`, `updateEmployeeProfile(id, patch)`, `inviteEmployee(input)`, `getEmployeeActivity(id)`, `getEmployeeWorkload(id)`. 
- `getEmployeeWorkload` cross-references `getProjectRows()` from `portfolioQueries.ts`, filtering by `consultantLead === employee.name`, returning project counts by status + the project list.
- Seed a small `activityLog: Record<employeeId, EmployeeActivityEntry[]>` with a handful of historical entries per employee (since this is a single-session demo app, other employees' "activity" can't come from a live store — it has to be seed data). `updateEmployeeRole`/`updateEmployeeProfile`/`inviteEmployee` should each append a new entry to the acting record's activity log (e.g. "Role changed to Inspector").

### 3. API contracts — `src/api/contracts/employees.ts` (new)
Typed request/response shapes: `EmployeeRow`, `EmployeeDetailResponse`, `EmployeeActivityResponse`, `EmployeeWorkloadResponse`, `UpdateEmployeeRoleRequest`, `UpdateEmployeeProfileRequest`, `InviteEmployeeRequest`/`Response` — mirror the style of `src/api/contracts/operations.ts`.

### 4. Mock handlers — `src/mocks/handlers/employees.ts` (new)
`GET /api/employees`, `GET /api/employees/:id`, `GET /api/employees/:id/activity`, `GET /api/employees/:id/workload`, `POST /api/employees/:id/role`, `POST /api/employees/:id/profile`, `POST /api/employees` (invite). Follow `src/mocks/handlers/operations.ts`'s pattern (`delay()`, `HttpResponse.json`). Register in `src/mocks/handlers.ts`.

### 5. Login role resolution — `src/mocks/handlers/auth.ts`
Change employee sign-in to resolve `role` via `findEmployeeByEmail(body.email)` instead of trusting whatever the client sends. Unrecognized employee emails keep falling back to `'overview'` (preserves today's permissive demo-login behavior for anyone not in the seeded directory). `src/features/auth/SignInPage.tsx` no longer needs to send a real role for employees — it can drop the `DEFAULT_EMPLOYEE_ROLE` constant entirely (server now decides).

### 6. Route + nav gating
- Add `src/shared/components/RequireRole.tsx`: reads `useAuthStore`, redirects to `/insightx` (not `/login` — they're authenticated, just unauthorized) if `session.user.role` doesn't match. Small, mirrors `RequireAuth.tsx`.
- In `src/app/router.tsx`, wrap specifically the `admin` child route's element with `<RequireRole role="admin">`.
- In `src/features/insightx/navItems.ts` consumption (`InsightXShell.tsx`), filter out the `admin` nav entry when `session.user.role !== 'admin'`.

### 7. Employee management UI — repurpose `src/features/insightx/administration/subviews/UsersView.tsx`
Replace the static hardcoded array with the real feature, matching `AssetRegistryPage.tsx`'s list+detail convention and reusing `DataTable`, `DetailDrawer`, `StatusChip`, `KpiStrip`:
- New `src/features/insightx/administration/subviews/employees/api.ts`: `useEmployees()`, `useEmployeeDetail(id)`, `useEmployeeActivity(id)`, `useEmployeeWorkload(id)`, `useUpdateEmployeeRole()`, `useUpdateEmployeeProfile()`, `useInviteEmployee()` — thin React Query wrappers over `apiGet`/`apiPost`, invalidating `['employees']` queries on mutation (same convention as `analyst/api.ts`'s `useCreateDeficiency`).
- KPI strip: total employees, active count, pending invites, admins.
- `DataTable` of employees (name, email, role chip, status chip) with `onRowClick` selecting an id.
- `DetailDrawer` for the selected employee with three sections: **Profile** (editable name/title/department/phone + status, email read-only since it's the login identity), **Access** (role `TextField select` bound to `EMPLOYEE_ROLE_OPTIONS`, save button), **Activity & Workload** (activity list + workload project counts/list).
- "Invite Employee" button opening a small dialog (name, email, role, optional title/department) → `useInviteEmployee`.
- Rename the nav entry in `src/features/insightx/administration/navItems.ts` from "Users" → "Employees" (keep or rename the `key`; check for other references before renaming).

### 8. Small coherence fix — `src/shared/store/auditLogStore.ts`
`logEvent` currently hardcodes `actor: 'Current Session'`. Pull the real actor from `useAuthStore.getState().session?.user.email` inside the store instead, so the existing admin Dashboard's "Recent Activity" panel also reflects real identities. No call-site changes needed (4 call sites: `ReportQaPage`, `CommunicationCenterPage`, `AnalystPage`, `DashboardView`/`AuditTrailView` as readers).

## Verification
- `npm run build` (runs `tsc -b`) and `npx oxlint` clean.
- `npm run dev`: sign in as `executive@absi.com` (any password ≥4 chars) → confirm redirect lands on `/insightx` with the Administration nav item visible, and `/insightx/admin` → Employees tab shows the seeded directory.
- Change another seeded employee's role in the Employees tab, sign out, sign back in as that employee's email → confirm they land on the new role's `ROLE_LANDING_PATH`.
- Sign in as a non-executive employee (e.g. an inspector-seeded email) → confirm the Administration nav item is hidden and manually navigating to `/insightx/admin` redirects away.
- Invite a brand-new employee via the dialog → confirm it appears in the list and (per above) can log in with the assigned role.
- Open an employee with a name matching a seeded `CONSULTANTS` entry → confirm the Workload tab shows real, non-zero project data.
