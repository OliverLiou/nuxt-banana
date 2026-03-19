# Feature Specification: Public Gallery View

**Feature Branch**: `dev`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "專案首頁 Public Gallery View — Hero Section + Gallery Grid with detail modal, infinite scroll, copy prompt, and empty state"

## Clarifications

### Session 2026-03-17

- Q: 畫廊網格的載入機制應採用無限捲動、分頁還是手動載入按鈕？ → A: 無限捲動（Infinite Scroll）
- Q: 圖片細節檢視應採用 Modal、全螢幕覆蓋還是側邊面板？ → A: 全螢幕覆蓋頁面（Fullscreen Overlay）
- Q: 細節輪播到達最後一張時，應循環回第一張還是停用按鈕？ → A: 循環輪播（Circular）
- Q: 開啟細節 Overlay 後按瀏覽器返回鍵，應關閉 Overlay 還是離開頁面？ → A: 推入瀏覽器歷史紀錄，返回鍵關閉 Overlay（URL 狀態如 `?item={id}`）
- Q: Gallery Grid 卡片圖片應如何處理不同尺寸的圖片？ → A: 固定長寬比（4:3），圖片以 object-cover 裁切填滿，卡片高度統一
- Q: Hero Marquee 與 Detail Carousel 自動播放是否應尊重 prefers-reduced-motion？ → A: 不處理，所有動畫一律播放

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Gallery Grid Browsing (Priority: P1)

A visitor arrives at the homepage and sees a grid of gallery images
sorted newest-first. Each card shows a thumbnail, title, and
color-coded badges. The grid loads additional items via infinite
scroll (or pagination) so performance stays smooth even with many
images. While images load, skeleton placeholders appear; if an image
fails to load, a graceful fallback is shown instead.

**Why this priority**: The gallery grid is the primary content of the
homepage. Without it, there is nothing for visitors to browse —
making it the essential MVP slice.

**Independent Test**: Can be fully tested by opening the homepage
and scrolling through the grid. Delivers immediate value: visitors
can discover and browse all published artwork.

**Acceptance Scenarios**:

1. **Given** the gallery contains active images, **When** a visitor
   opens the homepage, **Then** images are displayed in a responsive
   grid sorted by `created_at` descending (newest first).
2. **Given** images are loading, **When** the grid is rendered,
   **Then** skeleton placeholders appear in place of each card until
   the image is ready.
3. **Given** an image fails to load, **When** the card renders,
   **Then** a user-friendly fallback visual replaces the broken
   image (no broken-image icon).
4. **Given** more images exist than the initial batch, **When** the
   visitor scrolls to the bottom of the grid, **Then** additional
   images load automatically via infinite scroll.
5. **Given** each gallery card, **When** rendered, **Then** it
   displays the thumbnail, `title`, and `badges` with colors
   matching the badge configuration.

---

### User Story 2 — Image Detail Overlay (Priority: P2)

A visitor clicks a thumbnail in the gallery grid. A fullscreen
overlay opens showing the full-size image with a carousel to
navigate between images, the title, the complete prompt text,
all badges, and the creation date.

**Why this priority**: Detail viewing is the natural next step
after browsing. It lets visitors inspect artwork closely and read
the generation prompt — a key differentiator for an AI-art gallery.

**Independent Test**: Can be tested by clicking any gallery card
and verifying the overlay displays all required fields. Delivers
value independently: visitors can view artwork in detail.

**Acceptance Scenarios**:

1. **Given** the gallery grid is visible, **When** a visitor clicks
   a thumbnail, **Then** a fullscreen overlay opens showing the
   detail view.
2. **Given** the detail overlay is open, **When** it renders,
   **Then** it displays: the full image (`image_url`), title
   (`title`), complete prompt (`prompt`), badge array (`badges`),
   and creation date (`created_at`).
3. **Given** the detail overlay is open, **When** the visitor uses
   the carousel controls, **Then** they can navigate to the
   previous or next image in the gallery without closing the overlay.
4. **Given** the detail overlay is open, **When** the visitor clicks
   a close button, **Then** the overlay closes and the grid is
   visible again.

---

### User Story 3 — Copy Prompt (Priority: P2)

While viewing the detail overlay, a visitor clicks a "Copy Prompt"
button. The prompt text is copied to the clipboard and immediate
visual feedback confirms the copy succeeded.

**Why this priority**: Same priority as the detail overlay because
it is a lightweight addition that dramatically increases utility
for visitors who want to reuse prompts.

**Independent Test**: Can be tested by opening a detail overlay,
clicking the copy button, and pasting into a text editor. Delivers
value: visitors can quickly reuse generation prompts.

**Acceptance Scenarios**:

1. **Given** the detail overlay is open, **When** it renders,
   **Then** a "Copy Prompt" button is visible near the prompt text.
2. **Given** the detail overlay is open, **When** the visitor clicks
   "Copy Prompt", **Then** the `prompt` value is written to the
   system clipboard.
3. **Given** the copy succeeds, **When** the clipboard write
   completes, **Then** immediate visual feedback is shown (e.g.,
   a toast or button label change to "Copied!").

---

### User Story 4 — Hero Section (Priority: P3)

When a visitor first lands on the homepage, a hero section at the
top immediately communicates the website's theme and purpose. It
includes an eye-catching visual and a dynamic gallery carousel
that auto-plays through featured images.

**Why this priority**: The hero section provides first-impression
branding but is not required for core browsing functionality. The
site is fully usable without it.

**Independent Test**: Can be tested by loading the homepage and
verifying the hero renders with a title, description, and an
auto-playing image carousel.

**Acceptance Scenarios**:

1. **Given** a visitor opens the homepage, **When** the page loads,
   **Then** a hero section is prominently displayed at the top with
   a clear site title and description.
2. **Given** the hero section is visible, **When** it renders,
   **Then** a dynamic gallery carousel cycles through images
   automatically. Auto-play animations run unconditionally
   (no `prefers-reduced-motion` handling).
3. **Given** the hero section is visible, **When** viewed on
   mobile, tablet, or desktop, **Then** the layout adapts
   responsively and remains visually appealing.

---

### User Story 5 — Empty State (Priority: P3)

When there are no active gallery images, the homepage displays a
friendly empty-state message instead of a broken or blank grid.

**Why this priority**: Edge-case handling that prevents a poor
first impression when the gallery has no content yet.

**Independent Test**: Can be tested by filtering out all active
images and loading the homepage. Delivers value: visitors see a
clear message rather than a blank page.

**Acceptance Scenarios**:

1. **Given** no images have `isActive: true`, **When** a visitor
   opens the homepage, **Then** a friendly empty-state message is
   displayed (e.g., "目前尚無公開的展示作品").
2. **Given** the empty state is shown, **When** the visitor views
   it, **Then** no broken grid, missing-image icons, or layout
   errors are visible.

---

### Edge Cases

- What happens when a single image repeatedly fails to load?
  → The card shows a fallback placeholder; the grid layout remains
  intact.
- What happens when the clipboard API is unavailable (e.g., HTTP
  without secure context)?
  → The "Copy Prompt" button either degrades gracefully with a
  tooltip explaining the limitation or falls back to selecting the
  text for manual copy.
- What happens when gallery data contains zero badges for an image?
  → The card and detail overlay render without a badge section; no
  empty badge container is visible.
- What happens when the carousel in the detail overlay reaches the
  last image?
  → Navigation wraps around to the first image (circular carousel);
  likewise, navigating backward from the first image wraps to the
  last.
- What happens when the user presses the browser back button while
  the detail overlay is open?
  → The overlay closes and the URL returns to the base homepage;
  the page does not navigate away.
- What happens on extremely slow connections?
  → Skeleton placeholders remain visible until images finish
  loading; the UI never shows a blank or broken state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST display a hero section at the top
  containing a site title, description, and a dynamic image
  carousel.
- **FR-002**: The homepage MUST display a gallery grid of all
  images where `isActive` is `true`, sourced from the project's
  gallery data (`/shared/utils/galleryItems.ts`).
- **FR-003**: Gallery items MUST be sorted by `created_at` in
  descending order (newest first).
- **FR-004**: The gallery grid MUST implement infinite scroll to
  load additional images automatically as the visitor scrolls,
  ensuring smooth performance with large image sets.
- **FR-005**: Each gallery card MUST display a thumbnail in a fixed
  4:3 aspect ratio using `object-cover` to crop-fill the image area,
  ensuring uniform card heights across the grid. The card also
  displays `title` and `badges` with colors matching badge
  configuration.
- **FR-006**: The system MUST show skeleton placeholders while
  images are loading and a user-friendly fallback when an image
  fails to load.
- **FR-007**: Clicking a gallery card MUST open a fullscreen overlay
  displaying: a carousel for navigation, the full image
  (`image_url`), title (`title`), complete prompt (`prompt`), badge
  array (`badges`), and creation date (`created_at`). Opening the
  overlay MUST push a browser history entry (e.g., `?item={id}`)
  so that the browser back button closes the overlay instead of
  navigating away from the page.
- **FR-008**: The detail overlay MUST include a "Copy Prompt" button
  that writes the `prompt` value to the system clipboard and
  provides immediate visual confirmation of success.
- **FR-009**: When no active images exist, the homepage MUST
  display a friendly empty-state message instead of a blank or
  broken grid.
- **FR-010**: The entire homepage MUST be fully responsive across
  desktop, tablet, and mobile viewports.
- **FR-011**: All public-facing pages MUST be accessible without
  authentication.

### Key Entities

- **GalleryItem**: A displayable artwork entry with attributes:
  `id`, `image_url`, `title`, `prompt`, `badges` (array of label +
  color pairs), `created_at`, and `isActive`. Only items where
  `isActive` is `true` are shown to visitors.
- **Badge**: A categorization label attached to a GalleryItem,
  consisting of a text `label` and a `color` designation that
  determines visual appearance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can understand the site's
  purpose within 5 seconds of the page loading (hero section
  communicates theme clearly).
- **SC-002**: Visitors can browse the complete gallery with smooth
  scrolling; no perceptible lag or layout shift when loading
  additional images.
- **SC-003**: Visitors can open any image's detail view in a
  single click and see all metadata (image, title, prompt, badges,
  date) without additional navigation.
- **SC-004**: Visitors can copy any prompt to the clipboard in
  under 2 seconds (one click) and receive clear confirmation.
- **SC-005**: The homepage renders correctly and remains fully
  usable on screens from 320 px (mobile) to 2560 px (large
  desktop) without horizontal scrolling or broken layout.
- **SC-006**: When the gallery is empty, 100 % of visitors see a
  clear explanatory message rather than a blank or broken page.
