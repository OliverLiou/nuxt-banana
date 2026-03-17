# Research: Public Gallery View

**Date**: 2026-03-17
**Feature**: Public Gallery View
**Branch**: dev
**@nuxt/ui version**: ^4.4.0 (confirmed in package.json)

## Component Validation Summary

| Component     | Available | Key Props                                                                                   | Slots                                     | Notes                                                                                              |
| ------------- | --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| UPageCTA      | ✅ Yes    | `title`, `description`, `links`, `variant`, `orientation`, `reverse`                        | `#default` (content beside CTA)           | Works as planned. `links` accepts array of Button props.                                           |
| UMarquee      | ✅ Yes    | `reverse`, `orientation`, `repeat`, `overlay`                                               | `#default` (repeated content)             | Works as planned. No `items` prop—content is passed via default slot and repeated automatically.    |
| UScrollArea   | ✅ Yes    | `orientation`, `items`, `virtualize`, `as`, `ui`                                            | `#default`                                | v4.3+. Supports virtualization for large lists. Good fit for gallery grid.                          |
| UBlogPost     | ✅ Yes    | `title`, `description`, `date`, `badge`, `image`, `authors`, `variant`, `orientation`, `to` | `#default`, `#header`, `#body`, `#footer` | ⚠️ `badge` is a **prop** (Badge props object), NOT a `#badge` template slot. See D-002.            |
| UModal        | ✅ Yes    | `title`, `description`, `close`, `fullscreen`, `overlay`, `transition`, `dismissible`       | `#content`, `#header`, `#body`, `#footer` | `fullscreen` prop confirmed. `#content` slot replaces entire modal chrome—use `#body` for content. |
| UCarousel     | ✅ Yes    | `items`, `orientation`, `arrows`, `dots`, `autoplay`, `loop`, `startIndex`, `fade`          | `#default` (receives `{ item, index }`)   | ⚠️ `thumbnails` is NOT a prop. Implemented manually via `emblaApi.scrollTo()`. See D-004.          |
| UInput        | ✅ Yes    | `type`, `placeholder`, `color`, `variant`, `size`, `icon`, `avatar`, `loading`, `disabled`  | `#trailing`, `#default`                   | `disabled` is a native HTML attr, works as expected.                                               |
| UTextarea     | ✅ Yes    | `rows`, `placeholder`, `autoresize`, `maxrows`, `color`, `variant`, `size`, `icon`          | —                                         | `disabled` is a native HTML attr (not listed in docs but works). No `readonly` prop—use `disabled`. |
| UInputDate    | ✅ Yes    | `range`, `color`, `variant`, `size`, `disabled`                                             | —                                         | v4.2+. `disabled` is a prop. Displays a date field, NOT a full calendar by default.                |
| UBadge        | ✅ Yes    | `label`, `color`, `variant`, `size`, `icon`, `avatar`, `class`                              | `#default`                                | Works as planned. `label` and `color` props confirmed.                                             |

## Detailed Component Notes

### UPageCTA
- Props match plan exactly: `title`, `description`, `links`, `orientation`.
- `links` accepts an array of [Button props](https://ui.nuxt.com/components/button).
- `orientation` switches between stacked (vertical) and side-by-side (horizontal) layout.
- `reverse` flips the slot/content order.
- **Alternative**: `UPageHero` has identical props (`title`, `description`, `headline`, `links`, `orientation`, `reverse`) and is designed as a page hero section. Consider UPageHero if you want a full-width hero with more visual weight.

### UMarquee
- Content is placed in the **default slot** and repeated automatically.
- `orientation`: `'horizontal'` (default) or `'vertical'`.
- `reverse`: reverses scroll direction.
- `repeat`: number of times to repeat the content.
- `overlay`: controls gradient edge overlays (default true; set to `false` to remove).
- No `items` prop—you iterate manually within the slot.

### UScrollArea (v4.3+)
- Based on Reka UI ScrollArea.
- `orientation`: `'vertical'` (default) or `'horizontal'`.
- `items` + `virtualize`: enables virtual scrolling for large datasets.
- `virtualize` accepts `{ estimateSize, lanes, gap }` for tuning.
- Good for wrapping the gallery grid if the list is large.

### UBlogPost
- `badge` is a **prop** that accepts a `BadgeProps` object (e.g., `{ label: 'Art', color: 'primary' }`). It is rendered internally by the component.
- There is **no `#badge` template slot**. The `badge` styling slot in Tailwind Variants controls CSS classes, not Vue template slots.
- Available Vue template slots: `#default`, `#header`, `#body`, `#footer`.
- `image` prop accepts a string URL or an object with image properties.
- `to` prop makes the entire card a link (inherits from ULink).
- `date` prop accepts a string for display.
- `variant`: `'outline'` (default), `'soft'`, `'subtle'`, `'ghost'`, `'naked'`.

### UModal
- `fullscreen` prop: boolean, makes modal fill the entire viewport. ✅ Confirmed.
- `#content` slot: replaces the **entire** modal content area (header + body + footer). When using `#content`, you must provide your own layout.
- `#header`, `#body`, `#footer` slots: used when you want the default modal chrome (close button, padding, etc.).
- `dismissible`: controls whether clicking outside or pressing Escape closes the modal (default `true`).
- `scrollable`: makes body content scrollable within the overlay.
- v-model binding: `v-model:open` (not `v-model`).

### UCarousel
- Built on [Embla Carousel](https://www.embla-carousel.com/).
- `items`: array of any type, rendered via `#default` slot which receives `{ item, index }`.
- `loop`: boolean, enables infinite looping. ✅ Confirmed.
- `startIndex`: number, sets the initial slide (0-indexed). ✅ Confirmed.
- `autoplay`: boolean or `{ delay: number }` (Embla Autoplay plugin).
- `arrows`: boolean, shows prev/next buttons.
- `prev` / `next`: Button props objects to customize arrow buttons.
- `dots`: boolean, shows navigation dots.
- `fade`: boolean, replaces scroll with fade transitions.
- **Thumbnails**: NOT a built-in prop. Must be implemented manually using `emblaApi.scrollTo(index)` via `useTemplateRef`. Official example shows this pattern with `@select` event + `emblaApi`.
- Emits: `@select` with `selectedIndex`.
- Exposed: `emblaRef`, `emblaApi` via template ref.

### UInput / UTextarea
- Both support `disabled` as a native HTML attribute.
- `UInput` has `#trailing` and `#default` slots for custom content.
- For read-only display, `disabled` is the correct approach (no `readonly` prop documented).

### UInputDate (v4.2+)
- Based on Reka UI DateField.
- `disabled` prop: boolean. ✅ Confirmed.
- `mode` prop mentioned in forms reference: for range selection.
- `locale` prop: for localization.
- **Note**: This renders as an inline date field input, NOT a calendar popup by default.

### UBadge
- `label`: string text.
- `color`: semantic colors (`'primary'`, `'secondary'`, `'success'`, `'error'`, `'warning'`, `'info'`, `'neutral'`).
- `variant`: `'solid'`, `'outline'`, `'soft'`, `'subtle'`.
- `size`: `'xs'`, `'sm'`, `'md'`, `'lg'`.
- Can also use `#default` slot for custom content instead of `label`.

## Decision Log

### D-001: Hero Section Component
- **Decision**: Use `UPageCTA` as specified in plan.
- **Rationale**: `UPageCTA` provides the exact props needed (`title`, `description`, `links`, `orientation`) for a call-to-action hero. It's designed for in-page CTA sections.
- **Alternatives considered**:
  - `UPageHero`: Nearly identical API (`title`, `description`, `headline`, `links`, `orientation`, `reverse`). Better suited for full-width page heroes. Could be used instead if the gallery page needs a more prominent hero section. **Recommendation**: Evaluate both during implementation; `UPageHero` may provide better visual hierarchy.

### D-002: Gallery Card Component
- **Decision**: Use `UBlogPost` for gallery cards.
- **Rationale**: Provides `title`, `image`, `date`, `badge` (prop), `description`, `orientation`, and `variant` props. Excellent fit for image-centric gallery cards.
- **API correction**: The `badge` is a **prop** (accepts `BadgeProps` object like `{ label: 'Art', color: 'primary' }`), NOT a `#badge` template slot. Update implementation code to use `:badge="{ label: category, color: categoryColor }"` instead of `<template #badge>`.
- **Alternatives considered**:
  - `UCard`: More generic, would require building badge/image/title layout manually. Less out-of-the-box visual design.
  - `UPageCard`: Has `title`, `description`, and link support but less image-focused.

### D-003: Detail Overlay Component
- **Decision**: Use `UModal` with `fullscreen` prop.
- **Rationale**: `fullscreen` prop is confirmed. `#content` slot allows full control over modal layout. `dismissible` prop handles close-on-escape/outside-click.
- **Implementation notes**:
  - Use `#content` slot (not `#body`) for fullscreen layouts to bypass default modal chrome.
  - Bind with `v-model:open` (not `v-model`).
  - Use `dismissible` prop to control close behavior.
- **Alternatives considered**:
  - `USlideover`: Side panel, not suitable for fullscreen detail view.
  - `UDrawer`: Bottom sheet, better for mobile but not fullscreen detail.

### D-004: Image Carousel Component
- **Decision**: Use `UCarousel` with manual thumbnail implementation.
- **Rationale**: `UCarousel` provides `items`, `loop`, `startIndex`, `autoplay`, `arrows`, `dots` as native props. Embla-based, high-quality touch/drag support.
- **API correction**: `thumbnails` is NOT a built-in prop. Must implement manually:
  1. Use `useTemplateRef('carousel')` to access `emblaApi`.
  2. Listen to `@select` event for `activeIndex` tracking.
  3. Call `carousel.value?.emblaApi?.scrollTo(index)` on thumbnail click.
  4. Reference the official "With thumbnails" example in docs.
- **Alternatives considered**: No viable alternatives in @nuxt/ui for carousel functionality.

### D-005: Gallery Grid Scrolling
- **Decision**: Use `UScrollArea` for scrollable gallery container.
- **Rationale**: Provides `orientation` prop and optional `virtualize` for performance with large datasets. Based on Reka UI (accessible).
- **Implementation notes**:
  - For small galleries (<50 items): use without `virtualize`.
  - For large galleries (50+ items): enable `virtualize` with `estimateSize` for card height.
  - Available since v4.3+, which is within our `^4.4.0` dependency.
- **Alternatives considered**:
  - Native CSS `overflow-y: auto`: Simpler but loses custom scrollbar styling and virtualization.
  - `UBlogPosts`: Wraps `UBlogPost` in a responsive grid, but provides less scroll control. Could be used as the inner grid layout within `UScrollArea`.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| `#badge` template slot assumption is wrong—`badge` is a prop | Medium: requires code pattern change | Confirmed | Use `:badge="{ label, color }"` prop syntax instead of `<template #badge>` |
| Carousel thumbnails require manual implementation | Low: pattern is well-documented | Confirmed | Follow official "With thumbnails" example using `emblaApi.scrollTo()` and `@select` event |
| `UInputDate` disabled renders as date field, not formatted text | Low: visual difference from expectation | Possible | If plain text display is needed, use a `<span>` or `UInput` with a formatted date string instead |
| `UModal` `#content` slot removes default chrome | Medium: must build own header/close button | Known behavior | Use `#body`/`#header`/`#footer` slots if default chrome is desired; use `#content` only for fully custom layouts |
| `UScrollArea` virtualization may need tuning for card grids | Low: depends on dataset size | Possible | Start without `virtualize`; add it if performance degrades with large galleries |
| `UPageHero` may be better than `UPageCTA` for hero section | Low: similar API | Possible | Prototype both during implementation; swap is trivial since props are nearly identical |
