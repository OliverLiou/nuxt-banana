# Contract: Public Gallery Experience

## Purpose

Define the public data and interaction contract for the homepage hero, featured marquee, gallery
grid, and detail modal.

## Data Contract

| Consumer | Data Source | Required Fields | Rules |
|---|---|---|---|
| Hero CTA | `isActive = true` gallery feed | `title`, `image_url` | Uses the first 3 items with `isActive = true` as featured media |
| Marquee | `isActive = true` gallery feed | `image_url`, `title` | Reuses featured set; no records with `isActive = false` allowed |
| Gallery grid | `isActive = true` gallery feed | `image_url`, `title`, `badges`, `created_at` | Ordered by `created_at DESC` |
| Detail modal | Selected `isActive = true` item | `image_url`, `title`, `prompt`, `badges`, `created_at` | Opens from a selected grid item |

## Interaction Contract

| Interaction | Input | Result |
|---|---|---|
| Open detail | Click a gallery card | Modal opens with the selected gallery item |
| Copy prompt | Click the copy action in the modal | Prompt is written to clipboard and success/failure feedback appears |
| Continue browsing | Scroll inside the gallery section | More visible content appears without losing the current page context |

## UI State Contract

| State | Contract |
|---|---|
| Loading | Show skeleton placeholders for hero/grid content while the query is pending |
| Empty | Show a friendly empty state when no gallery items with `isActive = true` exist |
| Fetch failure | Show a visible error state with retry affordance |
| Image failure | Replace the broken image with a non-blocking fallback tile |

## Canonical Field Terms

| Concept | Field |
|---|---|
| Visibility status | `isActive` |
| Display chips | `badges` |
