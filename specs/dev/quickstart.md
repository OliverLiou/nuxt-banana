# Quickstart: Public Gallery View

**Date**: 2026-03-17
**Branch**: dev
**Prerequisites**: `npm install` completed

## Build Validation

Run these commands to verify the build is clean:

```bash
npx nuxi prepare
npm run build
```

Both commands MUST exit with code 0 and zero errors.

## Manual Validation Scenarios

### 1. Hero Section
1. Run `npm run dev` and open `http://localhost:3000`
2. Verify a hero section is visible at the top with:
   - Site title and description
   - A "瀏覽更多" link/button that scrolls to the gallery
   - Auto-scrolling image marquee
3. Resize browser to mobile width (<768px):
   - Verify marquee switches to horizontal orientation
   - Verify hero layout adapts responsively
4. Resize back to desktop (≥768px):
   - Verify marquee displays in vertical column layout

### 2. Gallery Grid
1. Scroll below the hero section
2. Verify gallery cards are displayed in a responsive grid
3. Verify each card shows: thumbnail image, title, badges (color-coded)
4. Verify cards are sorted newest-first (check dates)
5. Verify skeleton placeholders appear while images load (throttle network in DevTools)
6. Verify broken image shows fallback (modify an image_url temporarily)

### 3. Infinite Scroll
1. If items exceed the initial batch, scroll to bottom
2. Verify additional items load automatically
3. (With current 11 items, batch size may show all at once — verify no errors)

### 4. Detail Overlay
1. Click any gallery card
2. Verify fullscreen overlay opens with:
   - Image carousel (showing clicked image first)
   - Previous/Next navigation buttons
   - Auto-play cycling through images
   - Thumbnail strip below carousel (max 5 thumbnails)
3. Verify text info panel shows:
   - Title (disabled input)
   - Prompt text (disabled textarea)
   - Date formatted as YYYY-MM-DD (disabled date input)
   - All badges with correct colors
4. Navigate carousel to last image → verify it wraps to first (circular)
5. Click close button → verify overlay closes and grid is visible

### 5. Copy Prompt
1. Open detail overlay for any image
2. Click "Copy Prompt" button
3. Paste into a text editor
4. Verify the prompt text matches the gallery item's prompt
5. Verify visual feedback appears (toast or button label change)

### 6. Empty State
1. Temporarily set all `isActive: false` in `shared/utils/galleryItems.ts`
2. Reload the page
3. Verify friendly empty-state message appears (e.g., "目前尚無公開的展示作品")
4. Verify no broken grid or layout errors
5. Revert `isActive` changes

### 7. Responsive Design
1. Test at 320px width (mobile): verify no horizontal scroll, layout intact
2. Test at 768px width (tablet): verify grid adjusts columns
3. Test at 1920px+ width (desktop): verify full-width layout
4. Test at 2560px width (large desktop): verify no broken layout

### 8. Edge Cases
1. Image with zero badges: verify card renders without badge section
2. Long prompt text: verify textarea handles overflow gracefully
3. Long title: verify title input doesn't break layout

## Diagnostics Checklist

- [ ] `npx nuxi prepare` exits cleanly
- [ ] `npm run build` exits with zero errors
- [ ] No TypeScript errors in IDE
- [ ] No console errors in browser DevTools
- [ ] No layout shift on image load
- [ ] All @nuxt/ui components render correctly
