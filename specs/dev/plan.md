# Implementation Plan: Public Gallery View

**Branch**: `dev` | **Date**: 2026-03-17 | **Spec**: [specs/dev/spec.md](spec.md)
**Input**: Feature specification from `/specs/dev/spec.md`

## Summary

Build the Public Gallery View homepage comprising three sections: a Hero with `UPageCTA` + `UMarquee` auto-scrolling images, a scrollable Gallery Grid of `UBlogPost` cards, and a fullscreen Detail Overlay (`UModal`) with `UCarousel`, metadata fields, and a Copy Prompt button. All data comes from the existing static `shared/utils/galleryItems.ts` array, filtered to `isActive === true` and sorted newest-first via a shared composable. Responsive behaviour is achieved entirely through Tailwind CSS breakpoint classes — no new packages are introduced.

## Technical Context

**Language/Version**: TypeScript 5.x, Nuxt 4, Vue 3
**Primary Dependencies**: Nuxt 4, `@nuxt/ui` ^4.4.0, `@pinia/nuxt`, TailwindCSS
**Storage**: N/A (static data from `shared/utils/galleryItems.ts`)
**Testing**: Manual validation + `npx nuxi prepare` + `npm run build`
**Target Platform**: Browser-based SPA (`ssr: false`)
**Project Type**: Brownfield Nuxt 4 app rooted in `app/`, `public/`, `shared/`
**Performance Goals**: Smooth infinite scroll, no layout shift on image load
**Constraints**: No new packages, reuse `@nuxt/ui`, TailwindCSS only, Pinia setup stores
**Scale/Scope**: 11 static gallery items; infinite scroll for future scalability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Brownfield boundary is defined and no architectural or behavior change is planned without
      explicit user approval.
      — All new files reside within existing `app/components/`, `app/composables/`, and `app/pages/`. No top-level directories added. `shared/` is read-only.
- [x] Existing composables, components, and `@nuxt/ui` primitives to reuse are identified.
      — Reuses: `UPageCTA`, `UMarquee`, `UBlogPost`, `UScrollArea`, `UModal`, `UCarousel`, `UInput`, `UTextarea`, `UInputDate`, `UBadge`, `UButton`. See research.md for full component validation.
- [x] Route, styling, and state changes stay within `app/pages/`, TailwindCSS, and Pinia
      setup-store conventions.
      — Single page (`app/pages/index.vue`). All styling via Tailwind utilities. No Pinia store needed (no shared mutable state).
- [x] TypeScript contract updates for props, emits, state, and API data are identified.
      — Existing `GalleryItem` global type is sufficient. No new types required. Component props use inline type annotations.
- [x] Validation covers final diagnostics review and explains whether automated tests are
      intentionally omitted or explicitly requested.
      — Automated tests are intentionally omitted per constitution (VII) and spec. Validation: `npx nuxi prepare` + `npm run build` + manual browser verification.
- [x] Component names follow PascalCase and Vue SFC block order is
      `<template>` → `<script setup lang="ts">` → `<style scoped>`.
      — All new components: `HeroSection.vue`, `GalleryGrid.vue`, `GalleryDetailOverlay.vue`. SFC order enforced.
- [x] Duplicated logic is extracted into reusable composables or components.
      — Gallery data filtering/sorting extracted to `app/composables/useGalleryItems.ts`, shared by Hero and Grid.
- [x] No new packages or version-incompatible syntax are required.
      — ⚠️ **Flag**: User's plan references `@vueuse/core` (`useWindowSize`) which is NOT installed. Constitution II forbids new packages. **Resolution**: Use Tailwind CSS responsive classes (`hidden md:block` / `block md:hidden`) to toggle between mobile and desktop layouts. No runtime JS breakpoint detection needed.

## Project Structure

### Documentation (this feature)

```text
specs/dev/
├── plan.md              # This file
├── research.md          # Component validation & decision log
├── data-model.md        # GalleryItem entity definition
├── checklists/
│   └── requirements.md  # Acceptance criteria checklist
└── tasks.md             # To be created by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── app.vue                          # No changes
├── assets/
│   └── css/main.css                 # No changes
├── pages/
│   └── index.vue                    # MODIFY: replace placeholder with full homepage layout
├── components/
│   ├── HeroSection.vue              # NEW: Hero with UPageCTA + UMarquee
│   ├── GalleryGrid.vue              # NEW: Scrollable grid with UBlogPost cards
│   └── GalleryDetailOverlay.vue     # NEW: Fullscreen UModal with UCarousel + metadata
└── composables/
    └── useGalleryItems.ts           # NEW: Filter active items, sort by created_at desc

shared/
├── types/index.d.ts                 # No changes (GalleryItem type already defined)
└── utils/
    └── galleryItems.ts              # No changes (11 static items)
```

**Structure Decision**: All new files are within existing `app/components/`, `app/composables/`, and `app/pages/` directories. No new top-level folders. No brownfield exceptions needed. `app/stores/` is not used because there is no shared mutable state — the gallery data is read-only and derived via a composable.

## Implementation Details

### Data Layer

**File**: `app/composables/useGalleryItems.ts`

Create a composable that provides the filtered and sorted gallery data:

```ts
import { galleryItems } from '~/shared/utils/galleryItems'

export function useGalleryItems() {
  const activeItems = computed<GalleryItem[]>(() =>
    galleryItems
      .filter(item => item.isActive)
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  )

  return { activeItems }
}
```

- Filters `isActive === true`, sorts by `created_at` descending (newest first).
- Returns a `computed` so it's reactive and shareable across components.
- Used by `HeroSection.vue`, `GalleryGrid.vue`, and `GalleryDetailOverlay.vue`.

### Hero Section (`HeroSection.vue`)

**Component**: `UPageCTA` with `UMarquee` in the default slot.

**Props/Config**:
- `title`: project name (e.g., `"Nuxt Banana Gallery"`)
- `description`: randomly selected from a string array, assigned in `onMounted` to avoid SSR mismatch (though SSR is off, this keeps the pattern safe).
- `links`: `[{ label: '瀏覽更多', color: 'neutral' as const, variant: 'subtle' as const, to: '#gallery-grid' }]`

**Responsive Orientation** (Tailwind CSS classes, no `@vueuse/core`):
- Use two `<template>` blocks toggled by Tailwind `hidden`/`block` classes at the `md` breakpoint:
  - `md+` (`hidden md:block`): `<UPageCTA orientation="vertical">` with 3-column marquee layout.
  - Below `md` (`block md:hidden`): `<UPageCTA orientation="horizontal">` with single horizontal marquee.
- This avoids any runtime JS breakpoint detection and uses pure CSS visibility toggling.

**Marquee Logic**:
- Data source: `activeItems` from `useGalleryItems()`.
- **Desktop (md+)**: Split `activeItems` into 3 arrays using modular arithmetic (`items.filter((_, i) => i % 3 === col)`). Render 3 `<UMarquee orientation="vertical">` side by side in a flex row. Column at index 1 gets `reverse` prop for visual variation. Each marquee slot iterates its assigned items and renders `<img>` tags.
- **Mobile (below md)**: Single `<UMarquee orientation="horizontal">` iterating all `activeItems`.
- `:overlay="false"` to disable gradient overlays on marquees (optional, tune visually).

### Gallery Grid (`GalleryGrid.vue`)

**Container**: `<UScrollArea orientation="vertical">` with explicit height via Tailwind class `h-[calc(100vh-<hero-height>)]` (tune exact value during implementation). Add `id="gallery-grid"` for anchor link from Hero.

**Cards**: `<UBlogPost>` rendered via `v-for` over a paginated slice of `activeItems`:
- `:title="item.title"`
- `:image="item.image_url"`
- `:date="formatDate(item.created_at)"` — format as `YYYY-MM-DD` via a local helper or `new Date().toLocaleDateString()`.
- `:badge` — Since this prop accepts a **single** `BadgeProps` object but `GalleryItem` has an **array** of badges:
  - Pass the **first badge** to `:badge="item.badges[0]"` for the primary category display.
  - Render **all badges** in the `#footer` slot using `v-for` with `<UBadge>` components:
    ```vue
    <template #footer>
      <div class="flex flex-wrap gap-1">
        <UBadge v-for="badge in item.badges" :key="badge.label" :label="badge.label" :color="badge.color" variant="subtle" size="xs" />
      </div>
    </template>
    ```
- `@click` on each card: emit event or call a function to set `selectedItem` and open the detail overlay.

**Infinite Scroll**:
- Maintain a reactive `displayCount` ref, initially set to a batch size (e.g., 6).
- Use `useIntersectionObserver` pattern (native `IntersectionObserver` API — no package needed) with a sentinel `<div>` at the bottom of the grid.
- When the sentinel enters the viewport, increment `displayCount` by the batch size.
- The displayed items are `activeItems.slice(0, displayCount)`.
- When `displayCount >= activeItems.length`, hide the sentinel (all items loaded).

**Skeleton/Fallback**:
- Use `<img>` with `@load` and `@error` events, or `<NuxtImg>` placeholder behaviour.
- On error: swap `src` to a fallback placeholder image (e.g., a local `/images/placeholder.svg` or a neutral gradient `<div>`).

### Detail Overlay (`GalleryDetailOverlay.vue`)

**State**:
```ts
const isOpen = ref(false)
const selectedItem = ref<GalleryItem | null>(null)

function openDetail(item: GalleryItem) {
  selectedItem.value = item
  isOpen.value = true
}
```

**Modal**: `<UModal v-model:open="isOpen" fullscreen :dismissible="true">` using `#content` slot for full layout control (no default modal chrome).

**Layout** (inside `#content`):
- Close button: `<UButton icon="i-lucide-x" variant="ghost" @click="isOpen = false" />` positioned absolute top-right.
- **Desktop (md+)**: `flex flex-row` — left side (carousel, 60% width), right side (metadata, 40% width).
- **Mobile (below md)**: `flex flex-col` — carousel on top, metadata below.
- Use Tailwind responsive classes: `flex-col md:flex-row`, `w-full md:w-3/5`, `w-full md:w-2/5`.

**Carousel** (`UCarousel`):
- `items`: `activeItems` (all active gallery items, so user can navigate between them).
- `startIndex`: computed as `activeItems.findIndex(i => i.id === selectedItem.value?.id)` — opens on the clicked item.
- `loop`: `true` (circular navigation per spec).
- `autoplay`: `{ delay: 3000 }` (auto-advance every 3 seconds).
- `arrows`: `true` (prev/next buttons).
- `@select` event: update `selectedItem` to `activeItems[selectedIndex]` so metadata stays in sync.

**Thumbnail Strip** (manual implementation per research D-004):
- Below the main carousel, render up to 5 thumbnail `<img>` elements centered around the current index.
- Use `useTemplateRef('carousel')` to access `emblaApi`.
- On thumbnail click: `carousel.value?.emblaApi?.scrollTo(index)`.
- Highlight the active thumbnail with a ring/border class (e.g., `ring-2 ring-primary`).
- Compute visible thumbnail range: center on current index, clamp to array bounds, show max 5.

**Text Info Panel**:
- Title: `<UInput :model-value="selectedItem.title" disabled />` — read-only display.
- Prompt: `<UTextarea :model-value="selectedItem.prompt" disabled autoresize />` — read-only, auto-resizing.
- Date: `<UInputDate :model-value="parsedDate" disabled />` — where `parsedDate` is a `Date` object parsed from `created_at`. If `UInputDate` display is inadequate, fall back to `<UInput :model-value="formattedDate" disabled />`.
- Badges: `<div class="flex flex-wrap gap-1">` with `v-for` rendering `<UBadge :label :color variant="subtle" />`.

### Copy Prompt

- Button: `<UButton label="複製 Prompt" icon="i-lucide-copy" @click="copyPrompt" />` placed near the prompt textarea.
- Implementation using native Clipboard API (no new packages):
  ```ts
  const copyLabel = ref('複製 Prompt')

  async function copyPrompt() {
    if (!selectedItem.value) return
    try {
      await navigator.clipboard.writeText(selectedItem.value.prompt)
      copyLabel.value = '已複製！'
      setTimeout(() => { copyLabel.value = '複製 Prompt' }, 2000)
    } catch {
      // Fallback: select text for manual copy, or show error toast
    }
  }
  ```
- Visual feedback: button label changes to "已複製！" for 2 seconds.
- Alternatively, use `useToast()` from `@nuxt/ui` for a toast notification instead of label change.

### Empty State

- In `GalleryGrid.vue`, check `activeItems.length === 0`.
- Render an empty state using `@nuxt/ui` patterns:
  ```vue
  <div v-if="activeItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
    <UIcon name="i-lucide-image-off" class="size-16 text-neutral-400 mb-4" />
    <p class="text-lg text-neutral-500">目前尚無公開的展示作品</p>
  </div>
  ```
- When empty, the Hero section marquee also gracefully handles zero items (empty marquee renders nothing).

### Responsive Design

All responsive behaviour uses **Tailwind CSS breakpoint classes** — no runtime JS breakpoint detection.

| Breakpoint | Hero Orientation | Marquee Layout | Gallery Grid | Detail Overlay |
|------------|-----------------|----------------|--------------|----------------|
| < `md` (mobile) | `horizontal` | Single horizontal `UMarquee` | 1 column grid (`grid-cols-1`) | Vertical stack (`flex-col`) |
| ≥ `md` (tablet+) | `vertical` | 3 vertical `UMarquee` columns | 2-column grid (`md:grid-cols-2`) | Side-by-side (`md:flex-row`) |
| ≥ `lg` (desktop) | `vertical` | 3 vertical `UMarquee` columns | 3-column grid (`lg:grid-cols-3`) | Side-by-side, wider carousel |

**Technique**: Render both mobile and desktop variants in the DOM, toggle visibility with `hidden md:flex` / `flex md:hidden`. This is a standard Tailwind pattern that avoids hydration mismatches and requires zero JavaScript.

### Page Composition (`app/pages/index.vue`)

The index page orchestrates all three sections:

```vue
<template>
  <div>
    <HeroSection />
    <GalleryGrid @select="openDetail" />
    <GalleryDetailOverlay v-model:open="isOpen" :item="selectedItem" :items="activeItems" />
  </div>
</template>
```

- State for `isOpen` and `selectedItem` lives in `index.vue` and is passed down via props/events.
- Alternatively, `GalleryGrid` can directly control the overlay if co-located. Decide during implementation based on cleanliness.

## Complexity Tracking

| Concern | Resolution |
|---------|-----------|
| `@vueuse/core` not installed (user plan references `useWindowSize`) | **Constitution violation avoided**: Use Tailwind responsive classes (`hidden md:block` / `block md:hidden`) instead of runtime JS breakpoint detection. No new packages needed. |
| `UBlogPost` `badge` prop accepts only a single `BadgeProps` object | Pass first badge to `:badge` prop for primary display; render full badge array in `#footer` slot using `v-for` with `<UBadge>` components. |
| `UCarousel` thumbnails are not a built-in feature | Manual implementation following official "With thumbnails" example: `useTemplateRef` → `emblaApi.scrollTo(index)` + `@select` event for active tracking. |
| `UInputDate` may render differently than expected in disabled state | If display is inadequate, fall back to `<UInput>` with a pre-formatted date string (`YYYY-MM-DD`). |
| Infinite scroll with only 11 items | Implement `IntersectionObserver`-based sentinel pattern with batch size of 6. Works correctly with small datasets and scales for future growth. No new packages needed (native browser API). |
