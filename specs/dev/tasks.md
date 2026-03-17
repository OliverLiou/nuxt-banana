# Tasks — Public Gallery View

> Generated from `spec.md` + `plan.md` + `research.md`
> Feature: Public Gallery View (Nuxt 4 brownfield)

---

## Format Legend

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

| Token     | Meaning                                                      |
| --------- | ------------------------------------------------------------ |
| `- [ ]`   | Unchecked task (mandatory checkbox)                          |
| `[T0XX]`  | Sequential task ID                                           |
| `[P]`     | Parallelizable — touches a different file, no cross-task dep |
| `[US1]`…  | User-story label (only in story phases, not Setup/Polish)    |

## Path Conventions

| Alias           | Actual Path                                    |
| --------------- | ---------------------------------------------- |
| `composables/`  | `app/composables/`                             |
| `components/`   | `app/components/`                              |
| `pages/`        | `app/pages/`                                   |
| `shared/types/` | `shared/types/`                                |
| `shared/utils/` | `shared/utils/`                                |

---

## Phase 1 · Setup (3 tasks)

- [ ] [T001] Review plan, brownfield boundary, and affected repository paths — cross-reference `specs/dev/plan.md`, `specs/dev/spec.md`, and `specs/dev/research.md` to confirm scope
- [ ] [T002] [P] Inventory existing components, composables, and `@nuxt/ui` primitives to reuse per `specs/dev/research.md` — verify UBlogPost, UModal, UCarousel, UMarquee, UPageCTA, UBadge, UButton, UIcon availability
- [ ] [T003] [P] Confirm validation approach — `npx nuxi prepare` + `npm run build` for build validation, manual validation per `specs/dev/quickstart.md`

---

## Phase 2 · Foundational (2 tasks)

- [ ] [T004] Create `useGalleryItems` composable in `app/composables/useGalleryItems.ts` — import static items from `shared/utils/galleryItems.ts`, filter `isActive === true`, sort by `created_at` desc, return computed `activeItems`
- [ ] [T005] Scaffold page composition in `app/pages/index.vue` — replace placeholder `<h1>` with component slots (`HeroSection`, `GalleryGrid`, `GalleryDetailOverlay`), manage shared state (`isOpen`, `selectedItem`, `activeItems` from `useGalleryItems`). Include browser history management: watch `isOpen` to push/pop `?item={id}` query param, listen to `popstate` to close overlay on back button

---

## Phase 3 · US1 — Gallery Grid Browsing (P1) 🎯 MVP (5 tasks)

- [ ] [T006] [P] [US1] Create `GalleryGrid.vue` in `app/components/GalleryGrid.vue` — responsive grid layout with `UBlogPost` cards (`:title`, `:image` with 4:3 aspect-ratio `object-cover`, `:date` formatted YYYY-MM-DD, `:badge` first badge, `#footer` slot with all `UBadge` v-for). Grid classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`. Emit `select` event with `GalleryItem` on card click
- [ ] [T007] [US1] Implement infinite scroll in `app/components/GalleryGrid.vue` — reactive `displayCount` ref (initial batch size 6), sentinel `<div>` at bottom with native `IntersectionObserver`, increment `displayCount` on intersect, hide sentinel when all items displayed. Displayed items = `activeItems.slice(0, displayCount)`
- [ ] [T008] [US1] Implement image skeleton/fallback in `app/components/GalleryGrid.vue` — use `<img>` `@load`/`@error` events, show skeleton/loading state while loading, swap to fallback placeholder on error (local `/images/placeholder.svg` or neutral gradient div)
- [ ] [T009] [US1] Wire `GalleryGrid` into `app/pages/index.vue` — pass `activeItems` as prop or let component use `useGalleryItems` internally, connect `@select` event to set `selectedItem` and `isOpen` state
- [ ] [T010] [US1] Run `npx nuxi prepare` and `npm run build` — fix any TypeScript errors or build warnings introduced by US1 tasks

> **Checkpoint:** Gallery Grid is independently functional and testable.

---

## Phase 4 · US2 — Image Detail Overlay (P2) (5 tasks)

- [ ] [T011] [P] [US2] Create `GalleryDetailOverlay.vue` in `app/components/GalleryDetailOverlay.vue` — fullscreen `UModal` (`v-model:open`, `fullscreen`, `dismissible`), `#content` slot layout: close `UButton` (absolute top-right, icon `i-lucide-x`, variant `ghost`), responsive flex layout (`flex-col md:flex-row`), left side carousel area (`w-full md:w-3/5`), right side metadata panel (`w-full md:w-2/5`). Props: `open` (boolean, v-model), `item` (`GalleryItem | null`), `items` (`GalleryItem[]`)
- [ ] [T012] [US2] Implement `UCarousel` in `app/components/GalleryDetailOverlay.vue` — `items=props.items`, computed `startIndex` from `props.item.id`, `loop=true`, `autoplay={delay:3000}`, `arrows=true`. Listen to `@select` to update current displayed item (emit update event to parent). Implement manual thumbnail strip below carousel: `useTemplateRef('carousel')`, render up to 5 thumbnail imgs centered on current index, click calls `emblaApi.scrollTo(index)`, active thumbnail highlighted with `ring-2 ring-primary`
- [ ] [T013] [US2] Implement text info panel in `app/components/GalleryDetailOverlay.vue` — `UInput` disabled for title, `UTextarea` disabled autoresize for prompt, `UInputDate` disabled for date (fallback to `UInput` with formatted date string if display inadequate), flex-wrap `gap-1` div with v-for `UBadge` (`label`, `color`, `variant` subtle)
- [ ] [T014] [US2] Connect overlay to `app/pages/index.vue` — pass `isOpen` (`v-model:open`), `selectedItem` (`:item`), `activeItems` (`:items`) to `GalleryDetailOverlay`. Handle `@update:item` event to sync `selectedItem` when carousel navigates. Ensure browser history push/pop from Phase 2 works correctly with overlay open/close
- [ ] [T015] [US2] Run `npx nuxi prepare` and `npm run build` — fix any TypeScript errors or build warnings introduced by US2 tasks

> **Checkpoint:** Detail Overlay opens from grid, carousel navigates, metadata displays, back button closes overlay.

---

## Phase 5 · US3 — Copy Prompt (P2) (3 tasks)

- [ ] [T016] [US3] Add Copy Prompt button in `app/components/GalleryDetailOverlay.vue` — `UButton` with `label="複製 Prompt"`, `icon="i-lucide-copy"`, placed near prompt `UTextarea`. Implement `copyPrompt()` using native `navigator.clipboard.writeText()`. Reactive `copyLabel` ref changes to `"已複製！"` for 2 seconds on success via `setTimeout`
- [ ] [T017] [US3] Implement clipboard fallback in `app/components/GalleryDetailOverlay.vue` — catch block for clipboard API failure (HTTP without secure context). Show error toast via `useToast()` or fallback to selecting text for manual copy
- [ ] [T018] [US3] Run `npx nuxi prepare` and `npm run build` — fix any TypeScript errors or build warnings introduced by US3 tasks

> **Checkpoint:** Copy button works, visual feedback shown, graceful fallback.

---

## Phase 6 · US4 — Hero Section (P3) (4 tasks)

- [ ] [T019] [P] [US4] Create `HeroSection.vue` in `app/components/HeroSection.vue` — `UPageCTA` with title (`"Nuxt Banana Gallery"`), description (random from string array, assigned in `onMounted`), `links` (`[{ label: '瀏覽更多', color: 'neutral', variant: 'subtle', to: '#gallery-grid' }]`). Use `useGalleryItems()` for image data
- [ ] [T020] [US4] Implement responsive marquee in `app/components/HeroSection.vue` — two template blocks toggled by Tailwind classes. Desktop (`hidden md:block`): `UPageCTA` `orientation="vertical"` with 3 `UMarquee` `orientation="vertical"` in flex row, split `activeItems` into 3 arrays via modular arithmetic, column index 1 gets `reverse` prop. Mobile (`block md:hidden`): `UPageCTA` `orientation="horizontal"` with single `UMarquee` `orientation="horizontal"` iterating all items. Each marquee renders `<img>` tags. Set `:overlay="false"` on marquees
- [ ] [T021] [US4] Wire `HeroSection` into `app/pages/index.vue` — add `<HeroSection />` above `GalleryGrid` in template
- [ ] [T022] [US4] Run `npx nuxi prepare` and `npm run build` — fix any TypeScript errors or build warnings introduced by US4 tasks

> **Checkpoint:** Hero section renders with auto-scrolling marquee, responsive layout, CTA link scrolls to grid.

---

## Phase 7 · US5 — Empty State (P3) (3 tasks)

- [ ] [T023] [US5] Add empty state UI in `app/components/GalleryGrid.vue` — `v-if="activeItems.length === 0"` block with `UIcon` (`i-lucide-image-off`, `size-16 text-neutral-400 mb-4`) and text `"目前尚無公開的展示作品"` (`text-lg text-neutral-500`). Centered layout with `flex-col items-center justify-center py-20`
- [ ] [T024] [US5] Handle empty state in `app/components/HeroSection.vue` — ensure marquee gracefully renders nothing when `activeItems` is empty (no errors, no broken layout). Optionally hide marquee section entirely with `v-if`
- [ ] [T025] [US5] Run `npx nuxi prepare` and `npm run build` — fix any TypeScript errors or build warnings introduced by US5 tasks

> **Checkpoint:** Empty state message shown when all items inactive, no layout errors.

---

## Phase 8 · Polish & Cross-Cutting (5 tasks)

- [ ] [T026] [P] Verify responsive design across all breakpoints (320px, 768px, 1920px, 2560px) — check Hero orientation, grid columns, overlay layout per responsive design table in `specs/dev/plan.md`
- [ ] [T027] [P] Verify edge cases from spec — zero badges renders clean, long prompt text handled, long title handled, broken image fallback works
- [ ] [T028] Run `npx nuxi prepare` and `npm run build` — final clean build with zero errors
- [ ] [T029] Verify no new packages added to `package.json` and no constitution exceptions introduced
- [ ] [T030] Complete manual validation using all 8 scenarios in `specs/dev/quickstart.md`

> **Checkpoint:** All user stories validated, clean build, manual QA complete.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → no dependencies
Phase 2 (Foundational)   → Phase 1
Phase 3 (US1 Grid)       → Phase 2          ← BLOCKS US2, US5
Phase 4 (US2 Overlay)    → Phase 3 (US1)
Phase 5 (US3 Copy)       → Phase 4 (US2)
Phase 6 (US4 Hero)       → Phase 2 only     ← CAN PARALLEL with US1
Phase 7 (US5 Empty)      → Phase 3 (US1)
Phase 8 (Polish)         → all story phases
```

### User Story Dependencies

```
US1 (P1) → after Phase 2, no story deps
US2 (P2) → after US1 (grid card click → overlay)
US3 (P2) → after US2 (button inside overlay)
US4 (P3) → after Phase 2, independent — can parallel with US1
US5 (P3) → after US1 (modifies GalleryGrid.vue)
```

### Parallel Opportunities

```
T002 ∥ T003                → Setup: independent review tasks
T006 ∥ T019                → After Phase 2: GalleryGrid.vue ∥ HeroSection.vue
T011 ∥ T019                → Different files: GalleryDetailOverlay.vue ∥ HeroSection.vue
T023 ∥ T024                → Different files: GalleryGrid.vue ∥ HeroSection.vue
T026 ∥ T027                → Different verification scopes
```

---

## Parallel Examples

```
# After Phase 2 completes, launch US1 and US4 in parallel:
Task: T006 [P] [US1] Create GalleryGrid.vue in app/components/GalleryGrid.vue
Task: T019 [P] [US4] Create HeroSection.vue in app/components/HeroSection.vue

# Within Phase 8:
Task: T026 [P] Verify responsive design across all breakpoints
Task: T027 [P] Verify edge cases from spec
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. **Phase 1:** Setup → **Phase 2:** Foundational → **Phase 3:** US1
2. **STOP and VALIDATE:** Grid renders, infinite scroll works, skeletons/fallback show
3. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Grid) → Test → **MVP!**
3. US4 (Hero) can parallel with US2 start
4. US2 (Overlay) → Test
5. US3 (Copy) → Test
6. US5 (Empty) → Test
7. Polish → Final validation

---

## Notes

- **No automated tests** — per project constitution
- **No new npm packages** — all features built with existing `@nuxt/ui` primitives
- **Build validation** — `npx nuxi prepare` + `npm run build` after each user story
- **Manual QA** — `specs/dev/quickstart.md` scenarios as final gate
- **Existing read-only files** — `shared/types/index.d.ts` (GalleryItem type), `shared/utils/galleryItems.ts` (11 static items)
