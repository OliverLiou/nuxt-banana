# Tasks: Gallery Management

**Input**: Design documents from `/specs/dev/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No-Test Policy (per constitution — no test tasks generated)

**Status**: Base implementation complete. Phases 1–9 below are the original build tasks (all ✅). **Phase 10** contains alignment corrections to match the updated design specifications — UUID string types, GalleryFormState nullability (`string | null`), `.webp` 2MB upload, text image fallback `'尚未設定圖片'`, icon-only footer buttons, admin auth guard, USwitch display-only in table. spec.md now fully aligned with plan.md/tasks.md after consistency fixes (FR-010 display-only, US3 card footer copy, auth guard clarification, GalleryFormState nullability).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Nuxt 4 project with `app/` directory for pages, components, composables, stores
- **Shared types**: `shared/types/` (`index.d.ts` for global types, `index.ts` for exported types/utils)
- **Shared utils**: `shared/utils/gallery.ts`

---

## Phase 1–9: Base Implementation (Complete ✅)

<details>
<summary>Click to expand completed base tasks</summary>

### Phase 1: Setup

- [X] T001 Add placeholder fallback image in `public/placeholder.png` *(superseded by T101)*
- [X] T002 [P] Extend global type definitions in `shared/types/index.d.ts` and `shared/types/index.ts`
- [X] T003 [P] Create admin pages directory structure at `app/pages/admin/`

### Phase 2: Foundational

- [X] T004 Extend Pinia gallery store in `app/stores/galleryStore.ts`
- [X] T005 Rewrite `useGallery` composable in `app/composables/useGallery.ts`
- [X] T006 [P] Create `useGalleryAdmin` composable in `app/composables/useGalleryAdmin.ts`

### Phase 3: US1 — Browse Public Gallery

- [X] T007 [US1] Create public gallery page in `app/pages/gallery.vue`

### Phase 4: US2 — View Image Details

- [X] T008 [P] [US2] Create `GalleryDetail` modal component in `app/components/GalleryDetail.vue`
- [X] T009 [US2] Integrate `GalleryDetail` modal into gallery page in `app/pages/gallery.vue`

### Phase 5: US4 — Manage Gallery Items as Admin

- [X] T010 [US4] Create admin gallery management page in `app/pages/admin/gallery.vue`

### Phase 6: US5 — Create and Edit Gallery Items

- [X] T011 [P] [US5] Create `GalleryForm` component in `app/components/GalleryForm.vue`
- [X] T012 [US5] Integrate `GalleryForm` into `USlideover` in `app/pages/admin/gallery.vue`
- [X] T012b [US5] Add unsaved-changes navigation guard in `app/pages/admin/gallery.vue`

### Phase 7: US3 — Copy Prompt Text

- [X] T013 [P] [US3] Add copy prompt button to `GalleryDetail` modal
- [X] T014 [P] [US3] Add copy prompt button to gallery card footer

### Phase 8: US6 — Delete Gallery Items

- [X] T015 [US6] Add delete confirmation and execution in `app/pages/admin/gallery.vue`

### Phase 9: Polish

- [X] T016 [P] Image error fallback handling *(superseded by T108)*
- [X] T017 [P] Edge case handling for long prompts, special characters, Unicode
- [X] T018 Constitution compliance checklist validation

</details>

---

## Phase 10: Alignment Corrections

**Purpose**: Fix discrepancies between existing implementation and updated design specifications. Most changes are **brownfield corrections**. New files: `app/stores/userStore.ts`, `app/middleware/auth.ts` (additive, per Constitution I).

**Key changes addressed**:
1. `GalleryItem.id` type: `number` → `string` (UUID)
2. `created_at` type: `timestamp` → `string`
3. Image fallback: `placeholder.png` / `@error` handler → conditional text `'尚未設定圖片'`
4. File upload: `image/*` 5MB → `.webp` only, 2MB max
5. `UBlogPost` props: remove `description`, `date` (only `title` + `image` per R-002)
6. Footer buttons: icon-only, `variant="outline"`, `color="neutral"` per R-009
7. Admin table `USwitch`: `disabled: true` (display-only; toggle only via edit form)
8. Admin auth: `profiles`/`roles` table lookup → `userStore` (new Pinia store) → `auth.ts` middleware → `definePageMeta({ middleware: 'auth' })`; redirect to `/login` if unauthenticated, to `/` with toast if not admin
9. Admin table action buttons: edit `color="neutral"` / delete `color="error"`, both `variant="outline"`, icon-only
10. `GalleryFormState` fields: `title`, `image_url`, `prompt` → `string | null` (defaults: `null` not `''`)

---

### 10-A: Type System Alignment

**Purpose**: Fix `GalleryItem.id` from `number` to `string` (UUID) and `GalleryFormState` field nullability (`string` → `string | null`) across all type definitions

- [ ] T101 Fix `GalleryItem` interface in `shared/types/index.d.ts` — change `id: number` → `id: string`; change `created_at: timestamp` → `created_at: string`
- [ ] T102 [P] Fix `GalleryFormState` type in `shared/types/index.ts` — change `id?: number` → `id?: string`; change `title: string` → `title: string | null`; change `image_url: string` → `image_url: string | null`; change `prompt: string` → `prompt: string | null` (per data-model.md GalleryFormState contract)
- [ ] T103 [P] Verify `getDefaultFormState()` in `shared/utils/gallery.ts` — ensure `id` default is `undefined` (not `0`/`null`); change `title`, `image_url`, `prompt` defaults from `''` to `null` (per data-model.md GalleryFormState defaults)

---

### 10-B: Store & Composable Fixes

**Purpose**: Propagate UUID string type through state management and data-access layers

**⚠️ CRITICAL**: Phase 10-A (type fixes) must complete first

- [ ] T104 Fix `galleryStore.ts` in `app/stores/galleryStore.ts` — change `editingId: ref<number | null>(null)` → `ref<string | null>(null)`; verify `openEdit(item)` assigns `item.id` (now string) correctly; verify `removeItem(id)` parameter type is string
- [ ] T105 [P] Fix `useGalleryAdmin.ts` in `app/composables/useGalleryAdmin.ts` — change all `itemId: number` parameters to `itemId: string` in `toggleActive()`, `deleteItem()`, and any other functions accepting item id; verify Supabase `.eq('id', itemId)` calls work with string UUID

---

### 10-C: Admin Auth Guard & Infrastructure

**Purpose**: Add role-based access control to admin gallery page using `profiles`/`roles` tables, a new `userStore`, and route middleware

- [ ] T119 [P] Add `Profile` and `Role` TypeScript types to `shared/types/index.d.ts` or a new auth types file — `Profile: { id: string; userId: string; roleId: string }`, `Role: { id: string; created_at: string }`; ensure Supabase `database.types.ts` includes `profiles` and `roles` table types (run `npx supabase gen types` or add manually)
- [ ] T120 Create `app/stores/userStore.ts` — Pinia setup store with: `role: ref<string | null>(null)`, `isAdmin: computed(() => role.value === 'admin')`, `fetchRole()` action that queries `profiles` table via `useSupabaseClient().from('profiles').select('roleId').eq('userId', user.id).single()` and sets `role.value`, `clearRole()` action that resets role to null
- [ ] T121 Create `app/middleware/auth.ts` — Nuxt route middleware that reads `userStore.role`; if `role` is `null`/`undefined`, redirect to `/login` via `navigateTo('/login')`; if `role` is not `'admin'`, redirect to `/` with toast `'您無此頁面權限, 即將為您導回首頁'` via `useToast()` and `navigateTo('/')`
- [ ] T106 [US4] Update `app/pages/admin/gallery.vue` — add `definePageMeta({ middleware: 'auth' })` to activate the auth middleware; remove any inline role-check logic that duplicates the middleware's responsibility
- [ ] T122 [P] Update `app/pages/login.vue` — after successful Supabase login, call `userStore.fetchRole()` to cache the user's role from the `profiles` table; on logout, call `userStore.clearRole()` to reset cached role state

---

### 10-D: US1 Corrections — Browse Public Gallery

**Purpose**: Fix UBlogPost prop usage and image fallback

- [ ] T107 [US1] Update `app/pages/gallery.vue` UBlogPost rendering — remove `description` prop (do NOT bind `prompt` to description), remove `date` prop (do NOT bind `created_at` to date); only use `title` and `image` props per R-002; add an `@error` handler on the image element so that when `image_url` fails to load, the fallback text `'尚未設定圖片'` is displayed (e.g., set a reactive `imageError` flag per item, conditionally render text when the flag is true); when `item.image_url` is empty/null/undefined, show the fallback text directly without attempting to load

---

### 10-E: US2 Corrections — View Image Details

**Purpose**: Fix image fallback in detail modal

- [ ] T108 [US2] Update `app/components/GalleryDetail.vue` image display — use `<img :src="item.image_url" @error="onImageError">` with an error handler that sets a reactive flag; when the flag is true OR when `item.image_url` is empty/null, render styled text `'尚未設定圖片'` instead of the image; ensure no reference to `placeholder.png` remains

---

### 10-F: US3 Corrections — Copy Prompt & Footer Buttons

**Purpose**: Make gallery card footer buttons icon-only with correct variant/color

- [ ] T109 [US3] Update footer buttons in `app/pages/gallery.vue` `#footer` slot — for ALL buttons in the footer (copy prompt button, detail/view button): remove `label` prop (icon-only), set `variant="outline"`, set `color="neutral"` per R-009; ensure `@click.stop` is preserved to prevent event bubbling to card click

---

### 10-G: US4 Corrections — Admin Table

**Purpose**: Fix admin table image fallback, USwitch behavior, and action button styling

- [ ] T110 [US4] Update admin table `isActive` column in `app/pages/admin/gallery.vue` — verify `USwitch` has `disabled: true` prop (display-only, no inline toggle); remove any `onUpdate:modelValue` handler or `toggleActive()` wiring from the table USwitch; status toggling is done ONLY through the edit form's USwitch (not from the table row); verify that the edit form's USwitch for isActive still triggers a confirmation dialog when toggling to inactive (per US4-AC2)
- [ ] T111 [P] [US4] Update admin table image column in `app/pages/admin/gallery.vue` — replace `placeholder.png` fallback or `@error` handler in the `h()` render function with a ternary: if `row.original.image_url` exists render `h('img', ...)`, else render `h('span', { ... }, '尚未設定圖片')`
- [ ] T112 [P] [US4] Update admin table action buttons in `app/pages/admin/gallery.vue` — edit button: `color="neutral"`, `variant="outline"`, icon (e.g., `i-lucide-pencil`), **no label** (icon-only); delete button: `color="error"`, `variant="outline"`, icon (e.g., `i-lucide-trash-2`), **no label** (icon-only); per R-003 and R-009

---

### 10-H: US5 Corrections — Form Upload Constraints

**Purpose**: Restrict file upload to `.webp` format and 2MB max size

- [ ] T113 [US5] Update `app/components/GalleryForm.vue` file upload — change `accept` from `"image/*"` to `"image/webp"` (`.webp` only); change max file size validation from 5MB to 2MB (`2 * 1024 * 1024` bytes); update any user-facing validation error message to `'.webp 格式，最大 2MB'`; per R-006 and supabase-storage contract

---

### 10-I: Cleanup & Removal

**Purpose**: Remove stale assets that are no longer referenced

- [ ] T114 Delete `public/placeholder.png` if it exists — all image fallbacks now use text rendering `'尚未設定圖片'`; no code should reference this file after corrections above

---

### 10-J: Validation

**Purpose**: Verify all corrections are type-safe and constitution-compliant

- [ ] T115 Run `npx nuxi typecheck` — verify zero TypeScript errors across all modified files; fix any errors introduced by the `id: number → string` type migration
- [ ] T116 [P] Verify SFC block order in all `.vue` files — must be `<template>` → `<script setup lang="ts">` → `<style scoped>` per Constitution VI
- [ ] T117 Grep verification — confirm zero remaining references to `placeholder.png` across entire codebase (`grep -r "placeholder" app/ shared/`); confirm zero remaining `id: number` in type definitions (`grep -r "id.*number" shared/types/`)
- [ ] T118 Run quickstart.md compliance checklist — brownfield preservation ✅, dependency lock ✅, UI-first ✅, TypeScript strict ✅, auto-imports ✅, component standards ✅, Pinia setup stores ✅, no test files ✅

---

## Dependencies & Execution Order

### Phase 10 Internal Dependencies

```
10-A (Types) ──────┬──► 10-B (Store/Composable) ──► 10-D through 10-I (UI fixes)
                   │
                   └──► 10-C (Auth: T119 → T120 → T121 → T106 + T122)

10-D through 10-I ──► 10-I (Cleanup) ──► 10-J (Validation)
```

### Detailed Dependencies

- **10-A** (T101–T103): No dependencies — start immediately
- **10-B** (T104–T105): Depends on 10-A (type definitions must be correct before fixing store/composable references)
- **10-C** (T119–T122, T106): T119 (types) first → T120 (userStore, depends on types) → T121 (middleware, depends on userStore) → T106 (definePageMeta, depends on middleware) + T122 (login page, depends on userStore, parallel with T106)
- **10-D** (T107): Depends on 10-B (composable types must be aligned)
- **10-E** (T108): No dependency on other UI tasks — can run in parallel with 10-D, 10-F, 10-G, 10-H
- **10-F** (T109): Depends on 10-D (same file `gallery.vue` — do after T107)
- **10-G** (T110–T112): Depends on 10-B (admin page uses store/composable); T111 and T112 parallel with each other
- **10-H** (T113): No dependency on other UI tasks — can run in parallel with 10-D through 10-G
- **10-I** (T114): Depends on ALL UI fixes complete (10-D through 10-H — no code should reference placeholder.png)
- **10-J** (T115–T118): Depends on 10-I (all corrections and cleanup must be done before validation)

### Parallel Opportunities Within Phase 10

- T101, T102, T103 (type fixes) — all in different files, run in parallel
- T104 and T105 (store + composable) — different files, parallel after 10-A
- T106 (auth definePageMeta) and T122 (login page) — different files, parallel after T121
- T108 (GalleryDetail), T113 (GalleryForm) — different components, parallel
- T110, T111, T112 (admin table fixes) — same file but T111 and T112 are in different column definitions, parallel
- T115, T116 (typecheck + SFC order) — independent checks, parallel

### Optimal Single-Developer Path

1. **10-A**: T101 → T102 + T103 (parallel) → Types aligned
2. **10-B**: T104 → T105 → Store/Composable fixed
3. **10-C**: T119 → T120 → T121 → T106 + T122 (parallel) → Auth infrastructure complete
4. **10-D + 10-F** (same file): T107 → T109 → `gallery.vue` complete
5. **10-E**: T108 → `GalleryDetail.vue` complete
6. **10-G**: T110 → T111 + T112 (parallel) → `admin/gallery.vue` complete
7. **10-H**: T113 → `GalleryForm.vue` complete
8. **10-I**: T114 → Cleanup done
9. **10-J**: T115 + T116 (parallel) → T117 → T118 → Validation complete

---

## Notes

- Phase 10 tasks are **corrections to existing code** — new files: `app/stores/userStore.ts`, `app/middleware/auth.ts`
- [P] tasks = different files or non-overlapping code regions, no dependencies
- [Story] label maps task to specific user story for traceability
- No test files generated (No-Test Policy per constitution)
- All UI uses @nuxt/ui v4 components exclusively — invoke `nuxt-ui` skill when implementing
- All user-facing text in Traditional Chinese (繁體中文)
- Image fallback: render text `'尚未設定圖片'` — public gallery (`UBlogPost`) and detail modal use `@error` handler on image element; admin table uses conditional rendering in `h()` render function. **NOT** `placeholder.png`
- SFC block order: `<template>` → `<script setup lang="ts">` → `<style scoped>`
- Auto-imports: do NOT manually import `ref`, `computed`, `useRoute`, `useSupabaseClient`, `useToast`, etc.
- Commit after each sub-phase or logical group of tasks
- Auth flow: login page → `userStore.fetchRole()` → `auth.ts` middleware reads `userStore.role` → `definePageMeta({ middleware: 'auth' })` on admin pages
