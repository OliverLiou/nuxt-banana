# Tasks: Gallery Management

**Input**: Design documents from `/specs/dev/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No-Test Policy (per constitution — no test tasks generated)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Nuxt 4 project with `app/` directory for pages, components, composables, stores
- **Shared types**: `shared/types/index.d.ts`
- **Public assets**: `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, type definitions, and static assets

- [ ] T001 Add placeholder fallback image for broken image URLs in `public/placeholder.png`
- [ ] T002 [P] Extend global type definitions with `Badge`, `GalleryFormState`, and `BadgeColor` types in `shared/types/index.d.ts` — fix existing `created_at: timestamp` to `created_at: string`, add `Badge` interface (`{ label: string; color: BadgeColor }`), add `GalleryFormState` interface (`{ id?: number; title: string | null; image_url: string | null; upload_image: File | null; prompt: string | null; badges: Badge[]; isActive: boolean }`), add `getDefaultFormState()` factory function type
- [ ] T003 [P] Create admin pages directory structure at `app/pages/admin/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management and data-access layer that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extend Pinia gallery store with pagination state, admin state, form/slideover state, and all actions per store contract in `app/stores/galleryStore.ts` — add `page`, `hasMore`, `allItems`, `adminPending`, `adminError`, `slideoverOpen`, `editingId`, `formState`, `isEditMode` computed; add actions: `appendItems`, `setPage`, `setHasMore`, `resetPagination`, `setAllItems`, `setAdminPending`, `setAdminError`, `addItem`, `updateItemInList`, `removeItem`, `openCreate`, `openEdit`, `closeSlideover`, `resetForm`; preserve existing `setItems`, `setPending`, `setError`
- [ ] T005 Rewrite `useGallery` composable to replace mock data with real Supabase queries and infinite scroll pagination in `app/composables/useGallery.ts` — implement `loadMore()` with `.range(from, to)` pagination, `refresh()` for reset, `hasMore` computed, guard against duplicate calls, initial auto-load on mount, toast on error; return `{ items, pending, error, hasMore, loadMore, refresh }`
- [ ] T006 [P] Create `useGalleryAdmin` composable with full CRUD operations in `app/composables/useGalleryAdmin.ts` — implement `fetchAll()`, `submitForm()` (create/update with image upload), `toggleActive()`, `deleteItem()` (with storage cleanup), `uploadImage()`, `openCreate()`, `openEdit()`, `closeSlideover()`, `validate()` (custom UForm validation with create/edit mode detection); use toast notifications per contract error table; return all state refs and action functions

**Checkpoint**: Foundation ready — store extended, composables wired to Supabase, user story implementation can now begin

---

## Phase 3: User Story 1 — Browse Public Gallery (Priority: P1) 🎯 MVP

**Goal**: Visitors can browse a visually clean list of active gallery items with infinite scroll, each showing thumbnail, title, and badges

**Independent Test**: Open `/gallery` as an unauthenticated visitor and verify that only active items appear, sorted newest-first, with infinite scroll loading additional batches. Empty state message appears when no active items exist.

### Implementation for User Story 1

- [ ] T007 [US1] Create public gallery page in `app/pages/gallery.vue` — implement `UScrollArea` with responsive orientation (vertical on md+, horizontal on mobile via `useBreakpoints`), render `UBlogPost` cards mapping `GalleryItem` fields (`title`, `prompt` as description, `image_url` as image, `created_at` as formatted date, badges via `#badge` slot with `UBadge`), wire `useInfiniteScroll` from VueUse to `loadMore()` targeting ScrollArea viewport element `[data-reka-scroll-area-viewport]`, show loading skeleton during fetch, show empty state message "目前尚無公開的展示作品" when no items, handle image load errors with fallback placeholder

**Checkpoint**: User Story 1 complete — public gallery page shows active items with infinite scroll

---

## Phase 4: User Story 2 — View Image Details (Priority: P1)

**Goal**: Visitors can click a gallery item to see full details (high-res image, title, badges, date, prompt) in a modal overlay without leaving the gallery page

**Independent Test**: Click any gallery item and confirm the `UModal` displays high-resolution image, title, all badges with colors, creation date, and full prompt text. Closing the modal returns to the same scroll position.

### Implementation for User Story 2

- [ ] T008 [P] [US2] Create `GalleryDetail` modal component in `app/components/GalleryDetail.vue` — accept `item: GalleryItem` and `open: boolean` (v-model) props; use `UModal` to display full-resolution image (`image_url` with error fallback), title, all badges via `UBadge` with label and color, formatted creation date, full prompt text in scrollable container for long text; handle image error with placeholder fallback
- [ ] T009 [US2] Integrate `GalleryDetail` modal into gallery page in `app/pages/gallery.vue` — add `selectedItem` ref, bind `@click` on each `UBlogPost` card to set `selectedItem` and open modal, pass `selectedItem` to `GalleryDetail` component, ensure scroll position is preserved on modal close

**Checkpoint**: User Stories 1 AND 2 complete — gallery browsing with detail view modal working

---

## Phase 5: User Story 4 — Manage Gallery Items as Admin (Priority: P1)

**Goal**: Admins can view all gallery items (active and inactive) in a table with inline status toggle

**Independent Test**: Log in as admin, navigate to `/admin/gallery`, verify all items listed with thumbnail, title, truncated prompt, date, badges, and working `USwitch` status toggle with toast feedback.

### Implementation for User Story 4

- [ ] T010 [US4] Create admin gallery management page in `app/pages/admin/gallery.vue` — implement `UTable` with TanStack `ColumnDef<GalleryItem>[]` columns: image thumbnail (64x64 with error fallback), title, truncated prompt (max 48 chars), formatted date, `USwitch` for isActive toggle (with loading state via `togglingId` ref), badges via `UBadge` in flex container, actions column with edit and delete `UButton`s; call `fetchAll()` on mount; show loading state; add "新增項目" button with `i-lucide-plus` icon to open create slideover; wire `toggleActive()` from `useGalleryAdmin` to USwitch `onUpdate:modelValue`

**Checkpoint**: User Story 4 complete — admin can view all items and toggle status

---

## Phase 6: User Story 5 — Create and Edit Gallery Items (Priority: P1)

**Goal**: Admins can create new and edit existing gallery items via a structured form in a slide-over panel with image upload, badge management, and validation

**Independent Test**: Log in as admin, create a new item filling all required fields plus badges, save it. Then edit the same item, change title and badges, save. Verify changes persist and item appears on public gallery if active.

### Implementation for User Story 5

- [ ] T011 [P] [US5] Create `GalleryForm` component in `app/components/GalleryForm.vue` — implement `UForm` with custom `validate` prop (create/edit mode-aware validation per contract); fields: image section (show preview if `image_url` exists with "重新上傳" button, else show `UFileUpload` with `accept="image/*"` and 5MB limit), title `UInput`, prompt `UTextarea`, isActive `USwitch`, badge management UI (inline list of existing badges with remove button per badge, add-badge row with label `UInput` + color `USelect` from `BadgeColor` palette + add `UButton`, enforce max 10 badges and unique labels with duplicate warning); emit `submit` event; accept `formState`, `isEditMode`, `validate` as props
- [ ] T012 [US5] Integrate `GalleryForm` into `USlideover` in admin page `app/pages/admin/gallery.vue` — add `USlideover` with `v-model:open="slideoverOpen"`, dynamic title ("新增項目" / "編輯項目" based on `isEditMode`), `#body` slot containing `GalleryForm`, `#footer` slot with cancel button and submit button (with loading state); wire "新增項目" button to `openCreate()`, table edit buttons to `openEdit(item)`, form submit to `submitForm()` from `useGalleryAdmin`; refresh table after successful create/edit

**Checkpoint**: User Stories 1, 2, 4, AND 5 complete — full CRUD except delete, public gallery and admin management functional

---

## Phase 7: User Story 3 — Copy Prompt Text (Priority: P2)

**Goal**: Visitors can copy prompt text from the detail view and gallery card footer for reuse

**Independent Test**: Open an item's detail view, click "複製提示詞" button, paste into text editor to confirm accuracy. Verify toast confirmation "複製成功" appears. Test with special characters and multi-line prompts.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Add copy prompt button to `GalleryDetail` modal in `app/components/GalleryDetail.vue` — add `UButton` with `icon="i-lucide-copy"`, `label="複製提示詞"`, `variant="ghost"` that calls `navigator.clipboard.writeText(item.prompt)` with success toast "複製成功" via `useToast()`; handle clipboard API failure gracefully
- [ ] T014 [P] [US3] Add copy prompt button to gallery card footer in `app/pages/gallery.vue` — use `UBlogPost` `#footer` slot to add copy prompt `UButton` with same clipboard + toast pattern; prevent click event from bubbling to card click (detail modal open)

**Checkpoint**: User Story 3 complete — prompt copying works from both detail view and gallery cards

---

## Phase 8: User Story 6 — Delete Gallery Items (Priority: P2)

**Goal**: Admins can permanently delete gallery items with confirmation dialog

**Independent Test**: Log in as admin, click delete on a gallery item, confirm in dialog, verify item removed from admin list and public gallery. Cancel deletion and verify item remains.

### Implementation for User Story 6

- [ ] T015 [US6] Add delete confirmation and execution to admin page in `app/pages/admin/gallery.vue` — add `UModal` confirmation dialog with warning text "此操作無法復原，確定要刪除此項目嗎？", confirm and cancel buttons; wire table delete button to show confirmation dialog, confirm button to call `deleteItem(item)` from `useGalleryAdmin` (handles storage cleanup + database delete + toast), refresh table on success; handle delete failure with error toast and item preservation

**Checkpoint**: All user stories complete — full gallery management system functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and quality improvements that affect multiple user stories

- [ ] T016 [P] Ensure image error fallback handling works consistently across all views — verify `public/placeholder.png` is used in gallery cards (`app/pages/gallery.vue`), detail modal (`app/components/GalleryDetail.vue`), and admin table thumbnails (`app/pages/admin/gallery.vue`) via `@error` handler on `<img>` elements
- [ ] T017 [P] Handle edge cases for long prompts, special characters, and Unicode in `app/components/GalleryDetail.vue` and `app/pages/gallery.vue` — ensure prompt text container is scrollable for very long text, special characters render correctly, copy preserves exact content
- [ ] T018 Validate against quickstart.md constitution compliance checklist — verify brownfield preservation (no existing files broken), dependency lock (no new packages), UI-first (@nuxt/ui components used), TypeScript strict (no `any` types), auto-imports (no manual imports for Nuxt composables), component standards (PascalCase, template→script→style order), Pinia setup stores, no test files, toast feedback on all CRUD operations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T002 (types) from Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Phase 3): Foundation only
  - US2 (Phase 4): Depends on US1 (gallery page must exist for modal integration)
  - US4 (Phase 5): Foundation only — can run in parallel with US1/US2
  - US5 (Phase 6): Depends on US4 (admin page must exist for slideover integration)
  - US3 (Phase 7): Depends on US1 and US2 (gallery page and detail modal must exist)
  - US6 (Phase 8): Depends on US4 (admin page must exist for delete action)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 — Browse Public Gallery (P1)**: Can start after Foundational (Phase 2) — No story dependencies
- **US2 — View Image Details (P1)**: Depends on US1 (needs gallery page to integrate modal)
- **US4 — Manage Gallery Items (P1)**: Can start after Foundational (Phase 2) — Independent of US1/US2
- **US5 — Create and Edit Items (P1)**: Depends on US4 (needs admin page for slideover)
- **US3 — Copy Prompt Text (P2)**: Depends on US1 + US2 (needs gallery page and detail modal)
- **US6 — Delete Gallery Items (P2)**: Depends on US4 (needs admin page for delete action)

### Within Each User Story

- Components/pages before integration tasks
- Core functionality before edge case handling
- Each story should be independently verifiable at its checkpoint

### Parallel Opportunities

- T001, T002, T003 (Setup) can all run in parallel
- T005 and T006 (composables) can run in parallel after T004 (store)
- US1 (public gallery) and US4 (admin table) can run in parallel after Foundation
- T008 (GalleryDetail) and T011 (GalleryForm) can run in parallel (different components)
- T013 and T014 (copy prompt in two locations) can run in parallel
- T016 and T017 (polish tasks) can run in parallel

---

## Parallel Example: Foundation Phase

```bash
# After T004 (store extension) completes:
Task T005: "Rewrite useGallery composable in app/composables/useGallery.ts"
Task T006: "Create useGalleryAdmin composable in app/composables/useGalleryAdmin.ts"
# These operate on different files and can run simultaneously
```

## Parallel Example: After Foundation

```bash
# US1 and US4 have no cross-dependencies:
Task T007: "Create public gallery page in app/pages/gallery.vue"         # US1
Task T010: "Create admin gallery management page in app/pages/admin/gallery.vue"  # US4
# These can run simultaneously on different pages
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 — Browse Public Gallery (T007)
4. **STOP and VALIDATE**: Open `/gallery`, verify active items load with infinite scroll
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Browse Gallery) → Test → MVP!
3. Add US2 (Detail View) → Test → Enhanced browsing
4. Add US4 (Admin List) + US5 (Create/Edit) → Test → Admin management
5. Add US3 (Copy Prompt) → Test → Prompt sharing
6. Add US6 (Delete Items) → Test → Full feature
7. Polish → Final quality pass

### Optimal Single-Developer Path

1. Phase 1: Setup (all parallel) → ~5 min
2. Phase 2: T004 → T005 + T006 (parallel) → Foundation complete
3. Phase 3: T007 (public gallery with infinite scroll)
4. Phase 4: T008 → T009 (detail modal + integration)
5. Phase 5: T010 (admin table with toggle)
6. Phase 6: T011 → T012 (form component + slideover integration)
7. Phase 7: T013 + T014 (parallel copy prompt)
8. Phase 8: T015 (delete with confirmation)
9. Phase 9: T016 + T017 (parallel polish) → T018 (final validation)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently verifiable at its checkpoint
- No test files generated (No-Test Policy per constitution)
- All UI uses @nuxt/ui v4 components exclusively — invoke `nuxt-ui` skill when implementing
- All text is in Traditional Chinese (繁體中文)
- Commit after each task or logical group
- SFC block order: `<template>` → `<script setup lang="ts">` → `<style scoped>`
- Auto-imports: do NOT manually import `ref`, `computed`, `useRoute`, `useSupabaseClient`, `useToast`, etc.
