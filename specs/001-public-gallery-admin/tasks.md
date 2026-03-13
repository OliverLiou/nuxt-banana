# Tasks: Public Gallery and Admin Management

**Input**: Design documents from `/specs/001-public-gallery-admin/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `quickstart.md`, `contracts/`

**Tests**: Automated test tasks are intentionally omitted. This feature uses the manual validation flow in `specs/001-public-gallery-admin/quickstart.md` plus `npx nuxi prepare` and `npm run build`.

**Organization**: Tasks are grouped by user story so each story remains independently implementable and manually testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because the work targets a different file with no unmet dependency
- **[Story]**: Which user story the task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes exact repository file paths and brownfield-safe scope

## Path Conventions

- `app/pages/` for Nuxt routes
- `app/components/` for reusable UI
- `app/composables/` for shared feature logic
- `app/stores/` for Pinia setup stores
- `app/middleware/` for route guards
- `app/types/` and `shared/types/` for explicit TypeScript contracts
- Stay within existing `app/`, `public/`, and `shared/` boundaries and do not add packages

## Phase 1: Setup

**Purpose**: Confirm the approved feature scope, constraints, and manual validation targets before touching app code.

- [ ] T001 Review scope, priorities, and acceptance criteria in `specs/001-public-gallery-admin/spec.md` and `specs/001-public-gallery-admin/plan.md`
- [ ] T002 [P] Review implementation decisions and entity rules in `specs/001-public-gallery-admin/research.md` and `specs/001-public-gallery-admin/data-model.md`
- [ ] T003 [P] Review manual validation flows and UI contracts in `specs/001-public-gallery-admin/quickstart.md`, `specs/001-public-gallery-admin/contracts/public-gallery.md`, `specs/001-public-gallery-admin/contracts/admin-gallery-management.md`, and `specs/001-public-gallery-admin/contracts/auth-access.md`

---

## Phase 2: Foundational

**Purpose**: Establish shared typed contracts and auth scaffolding required by the brownfield Nuxt app before story delivery.

**⚠️ CRITICAL**: Complete this phase before starting user story implementation.

- [ ] T004 Restore typed Supabase schema support for gallery and profile queries in `app/types/database.types.ts`
- [ ] T005 Update shared gallery badge, public selection, admin form, and auth profile contracts in `shared/types/index.d.ts`
- [ ] T006 [P] Scaffold the Pinia setup store shape for derived auth state in `app/stores/auth.store.ts`
- [ ] T007 [P] Scaffold route-facing session and role helpers in `app/composables/useAuthAccess.ts`
- [ ] T008 [P] Create the named admin route middleware entry point in `app/middleware/auth.ts`
- [ ] T009 Replace the missing `useUserStore()` dependency with the new app shell wiring in `app/app.vue`

**Checkpoint**: Shared types and app-level auth scaffolding are ready for feature work.

---

## Phase 3: User Story 1 - Public Gallery (Priority: P1) 🎯 MVP

**Goal**: Deliver the public homepage gallery that shows only items with `isActive = true`, highlights featured work, and lets visitors inspect and copy prompt details.

**Independent Test**: Open `/`, confirm only items with `isActive = true` appear in newest-first order, open a detail modal, and copy prompt text with visible success feedback.

**Validation Note**: Automated tests were not requested; use manual validation for this story.

- [ ] T010 [P] [US1] Implement `isActive = true` gallery fetching, featured-item derivation, selection state, and retry handling in `app/composables/usePublicGallery.ts`
- [ ] T011 [P] [US1] Build the featured public CTA surface for gallery items with `isActive = true` in `app/components/gallery/GalleryHero.vue`
- [ ] T012 [P] [US1] Build the responsive featured artwork marquee with graceful image fallbacks in `app/components/gallery/GalleryMarquee.vue`
- [ ] T013 [P] [US1] Build the public gallery grid inside a continued-browsing `UScrollArea` with newest-first cards plus loading, empty, and fetch-failure states in `app/components/gallery/GalleryGrid.vue`
- [ ] T014 [P] [US1] Build the gallery detail modal with full metadata display and copy-to-clipboard feedback in `app/components/gallery/GalleryDetailModal.vue`
- [ ] T015 [US1] Compose the public homepage experience in `app/pages/index.vue` using `app/composables/usePublicGallery.ts` and the gallery components

**Checkpoint**: User Story 1 is independently functional as the MVP public experience.

---

## Phase 4: User Story 2 - Admin Catalog Management (Priority: P2)

**Goal**: Give authorized administrators a full catalog workspace to view, create, edit, manage badges, and switch gallery items between `isActive = true` and `isActive = false`.

**Independent Test**: Open `/admin` as an authorized admin, confirm all items load in newest-first order, create a valid item, edit an existing item without replacing its image, and see clear success feedback after each save.

**Validation Note**: Automated tests were not requested; use manual validation for this story.

- [ ] T016 [P] [US2] Implement newest-first admin catalog loading for all items, base create and update persistence, and list refresh helpers in `app/composables/useAdminGallery.ts`
- [ ] T017 [P] [US2] Build repeatable badge row editing with explicit color typing in `app/components/admin/BadgeRepeater.vue`
- [ ] T018 [P] [US2] Build the admin catalog table with thumbnail, prompt preview, `isActive` status, badge summary, and row actions in `app/components/admin/AdminGalleryTable.vue`
- [ ] T019 [US2] Build the create and edit slideover form with mode-aware validation, optional badges, existing-image versus replacement-image handling, `.webp` and 2 MB upload constraints, and field-level feedback in `app/components/admin/AdminGalleryFormSlideover.vue`
- [ ] T020 [US2] Compose the admin catalog workspace in `app/pages/admin/index.vue` using `app/composables/useAdminGallery.ts`, `app/components/admin/AdminGalleryTable.vue`, and `app/components/admin/AdminGalleryFormSlideover.vue`

**Checkpoint**: User Stories 1 and 2 are independently usable for public browsing and admin catalog maintenance.

---

## Phase 5: User Story 3 - Auth and Safeguards (Priority: P3)

**Goal**: Protect admin access, complete the login and callback flow, and guard destructive or invalid admin operations.

**Independent Test**: Visit `/admin` while signed out and confirm redirect to `/`; sign in through `/login` and `/confirm`, return to `/admin` as an authorized admin, cancel a delete once, then confirm delete, and verify save attempts fail safely when a public image URL cannot be produced.

**Validation Note**: Automated tests were not requested; use manual validation for this story.

- [ ] T021 [P] [US3] Implement Supabase-session-derived role hydration, `isAuthenticated`, `isAdmin`, and reset behavior in `app/stores/auth.store.ts`
- [ ] T022 [US3] Implement login, callback, and admin redirect helpers in `app/composables/useAuthAccess.ts`
- [ ] T023 [P] [US3] Build the Google sign-in entry form with pending and error feedback in `app/components/auth/LoginAuthForm.vue`
- [ ] T024 [US3] Implement the named admin middleware that waits for role hydration and redirects unauthorized access in `app/middleware/auth.ts`
- [ ] T025 [US3] Build the public admin sign-in route in `app/pages/login/index.vue` using `app/components/auth/LoginAuthForm.vue`
- [ ] T026 [US3] Build the Supabase callback resolver and safe redirect flow in `app/pages/confirm/index.vue`
- [ ] T027 [P] [US3] Harden image save safeguards with public-URL verification, failure rollback, and cleanup logic in `app/composables/useAdminGallery.ts`
- [ ] T028 [P] [US3] Add explicit delete-confirmation interactions and cancel-safe row actions in `app/components/admin/AdminGalleryTable.vue`
- [ ] T029 [US3] Integrate auth middleware, protected admin rendering, and safeguarded delete and save flows in `app/pages/admin/index.vue`

**Checkpoint**: All user stories are independently functional with protected admin access and guarded destructive flows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize shared UX consistency, compliance checks, and release validation across all stories.

- [ ] T030 [P] Reconcile global shell copy, navigation affordances, and overlay behavior in `app/app.vue`
- [ ] T031 [P] Audit final explicit type coverage and terminology mapping in `shared/types/index.d.ts` and `app/types/database.types.ts`
- [ ] T032 [P] Confirm dependency discipline and brownfield-safe scope in `package.json` and `specs/001-public-gallery-admin/plan.md`
- [ ] T033 Run diagnostics, `npx nuxi prepare`, and `npm run build` from `package.json` and fix any generated-type issues surfaced in `app/app.vue`
- [ ] T034 Execute the end-to-end manual validation checklist in `specs/001-public-gallery-admin/quickstart.md` for `/`, `/login`, `/confirm`, and `/admin`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** → no dependencies
- **Phase 2: Foundational** → depends on Phase 1 and blocks all user stories
- **Phase 3: User Story 1** → depends on Phase 2 only and is the MVP release slice
- **Phase 4: User Story 2** → depends on Phase 2 and should start after User Story 1 is stable for incremental delivery
- **Phase 5: User Story 3** → depends on Phase 2 and extends the admin files created in User Story 2, so complete it after User Story 2
- **Phase 6: Polish** → depends on the user stories targeted for release

### User Story Dependency Graph

- **US1 (Public Gallery)** → starts after Foundational and has no dependency on admin stories
- **US2 (Admin Catalog Management)** → starts after Foundational; recommended after US1 MVP validation because it introduces the admin workspace
- **US3 (Auth and Safeguards)** → starts after Foundational, but its final integration in `app/pages/admin/index.vue` and `app/components/admin/AdminGalleryTable.vue` depends on the admin surfaces from US2

### Within-Story Execution Rules

- Complete shared or scaffold files before integrating dependent pages
- Finish component and composable work before route composition tasks in the same story
- Reserve diagnostics, prepare, build, and end-to-end manual validation for the final polish phase

### Parallel Opportunities

- Setup tasks `T002` and `T003` can run in parallel after `T001`
- Foundational scaffolding tasks `T006`, `T007`, and `T008` can run in parallel after `T004` and `T005`
- User Story 1 tasks `T010` through `T014` can run in parallel before `T015`
- User Story 2 tasks `T016`, `T017`, and `T018` can run in parallel before `T019` and `T020`
- User Story 3 tasks `T021`, `T023`, `T027`, and `T028` can run in parallel before the route integration tasks
- Polish tasks `T030`, `T031`, and `T032` can run in parallel before `T033` and `T034`

---

## Parallel Example: User Story 1

```bash
Task: "T010 Implement isActive=true gallery fetching and selection state in app/composables/usePublicGallery.ts"
Task: "T011 Build featured CTA in app/components/gallery/GalleryHero.vue"
Task: "T012 Build marquee in app/components/gallery/GalleryMarquee.vue"
Task: "T013 Build gallery grid in app/components/gallery/GalleryGrid.vue"
Task: "T014 Build detail modal in app/components/gallery/GalleryDetailModal.vue"
```

Then complete:

```bash
Task: "T015 Compose the public homepage in app/pages/index.vue"
```

---

## Parallel Example: User Story 2

```bash
Task: "T016 Implement admin catalog data helpers in app/composables/useAdminGallery.ts"
Task: "T017 Build badge repeater in app/components/admin/BadgeRepeater.vue"
Task: "T018 Build admin table in app/components/admin/AdminGalleryTable.vue"
```

Then complete:

```bash
Task: "T019 Build the admin form slideover in app/components/admin/AdminGalleryFormSlideover.vue"
Task: "T020 Compose the admin page in app/pages/admin/index.vue"
```

---

## Parallel Example: User Story 3

```bash
Task: "T021 Implement derived auth store state in app/stores/auth.store.ts"
Task: "T023 Build login form UI in app/components/auth/LoginAuthForm.vue"
Task: "T027 Harden save rollback logic in app/composables/useAdminGallery.ts"
Task: "T028 Add delete confirmation behavior in app/components/admin/AdminGalleryTable.vue"
```

Then complete:

```bash
Task: "T022 Implement auth helpers in app/composables/useAuthAccess.ts"
Task: "T024 Implement auth middleware in app/middleware/auth.ts"
Task: "T025 Build login route in app/pages/login/index.vue"
Task: "T026 Build confirm route in app/pages/confirm/index.vue"
Task: "T029 Integrate protected admin flows in app/pages/admin/index.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `/` manually using `specs/001-public-gallery-admin/quickstart.md`
5. Stop for review or demo before beginning admin work

### Incremental Delivery

1. Finish Setup and Foundational to establish the typed brownfield baseline
2. Deliver User Story 1 as the public MVP
3. Add User Story 2 for admin catalog management
4. Add User Story 3 for protected access and destructive-operation safeguards
5. Finish with Polish to clear diagnostics, build validation, and manual regression checks

### Parallel Team Strategy

1. One developer completes Foundational types and app shell updates
2. After Foundational:
   - Developer A implements User Story 1 components and route composition
   - Developer B prepares User Story 2 admin data and UI surfaces
   - Developer C prepares User Story 3 auth store and login UI scaffolding
3. Merge User Story 2 before User Story 3 final admin integration to avoid conflicts in `app/pages/admin/index.vue`

---

## Notes

- All tasks stay within existing brownfield boundaries
- Reuse Nuxt composables and `@nuxt/ui` primitives before introducing new abstractions
- Keep Pinia stores as setup stores and keep TypeScript contracts explicit
- Do not add automated tests unless the feature scope changes
- End implementation with diagnostics review, `npx nuxi prepare`, `npm run build`, and the manual quickstart checklist
