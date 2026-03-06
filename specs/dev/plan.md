# Implementation Plan: Gallery Management

**Branch**: `dev` | **Date**: 2026-03-05 | **Spec**: [specs/dev/spec.md](spec.md)
**Input**: Feature specification from `/specs/dev/spec.md`

## Summary

Gallery Management feature implementing a public gallery page (browse active items with infinite scroll, detail modal, copy prompt) and an admin management page (CRUD operations via UTable + USlideover + UForm, image upload to Supabase Storage, inline status toggle). Uses @nuxt/ui v4 components with Supabase backend for data persistence and image storage.

Detailed UI implementation plan available at `.specify/sdd-docs/plan.md`.

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3.5+, Nuxt 4.3+  
**Primary Dependencies**: @nuxt/ui v4.4+, @nuxtjs/supabase v2.0.3, @pinia/nuxt v0.11.3, TailwindCSS 4  
**Storage**: Supabase (PostgreSQL for data, Supabase Storage for images)  
**Testing**: No-Test Policy (per constitution — no tests required)  
**Target Platform**: Web SPA (SSR disabled in nuxt.config.ts)  
**Project Type**: Web application (single Nuxt project, fullstack via Supabase)  
**Performance Goals**: Standard web performance (< 2s scroll-load batch, responsive UI at 60fps)  
**Constraints**: Dependencies locked (no new npm packages), brownfield preservation (additive changes only), @nuxt/ui components preferred  
**Scale/Scope**: Small gallery (< 1000 items), single admin role, single language (Traditional Chinese)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Justification |
|---|-----------|--------|---------------|
| I | Brownfield Preservation (NON-NEGOTIABLE) | ✅ PASS | All changes are additive: new pages (gallery, admin), new/extended components, extending existing store/composable. No existing code modified. |
| II | Dependency Lock (NON-NEGOTIABLE) | ✅ PASS | All needed packages already in package.json: @nuxt/ui v4.4+, @nuxtjs/supabase, @pinia/nuxt, TailwindCSS 4. |
| III | UI-First Development | ✅ PASS | Using @nuxt/ui components exclusively (UScrollArea, UBlogPost, UTable, UForm, USlideover, UBadge, UButton, USwitch, UFileUpload, UToast). nuxt-ui skill will be invoked. |
| IV | TypeScript Strictness | ✅ PASS | GalleryItem interface already defined in shared/types/index.d.ts. Will maintain strict typing. |
| V | Nuxt Auto-Import Convention | ✅ PASS | Existing code already uses auto-imports (useSupabaseClient, useAsyncData, etc.). |
| VI | Component Standards | ✅ PASS | PascalCase naming, template→script→style block order enforced. |
| VII | Pinia Setup Stores | ✅ PASS | galleryStore.ts already uses defineStore with setup function pattern. |
| VIII | No-Test Policy | ✅ PASS | No test files will be generated. |

**No violations. Gate PASSES.**

### Post-Design Re-Evaluation (after Phase 1 artifacts)

*Re-checked against: plan.md, data-model.md, contracts/\*, quickstart.md, research.md*

| # | Principle | Status | Justification |
|---|-----------|--------|---------------|
| I | Brownfield Preservation (NON-NEGOTIABLE) | ✅ PASS | All new pages/components/composables are additive. Existing `galleryStore.ts` and `useGallery.ts` are extended (new state/actions appended), not rewritten. Existing `setItems`/`setPending`/`setError` preserved. |
| II | Dependency Lock (NON-NEGOTIABLE) | ✅ PASS | All referenced packages are in `package.json`: @nuxt/ui, @nuxtjs/supabase, @pinia/nuxt, tailwindcss, vue, vue-router, nuxt. `@tanstack/vue-table` types and VueUse composables (`useInfiniteScroll`, `useBreakpoints`) are transitive dependencies of @nuxt/ui — no new installs required. |
| III | UI-First Development | ✅ PASS | Artifacts use @nuxt/ui exclusively: UScrollArea, UBlogPost, UBadge, UButton, UTable, USwitch, USlideover, UForm, UFormField, UInput, UTextarea, UFileUpload, USelect, UModal. No custom UI primitives reinvented. |
| IV | TypeScript Strictness | ✅ PASS | All entities have explicit interfaces: `GalleryItem`, `Badge`, `GalleryFormState`, `CreateItemInput`, `UpdateItemInput`. `BadgeColor` derived from `BadgeProps['color']`. No `any` types. All function signatures typed. |
| V | Nuxt Auto-Import Convention | ✅ PASS | Composables (`useSupabaseClient`, `useToast`, `useGalleryStore`, `ref`, `computed`, `toRef`) used without imports. Only necessary type imports (`FormError`, `BadgeProps`, `ColumnDef`) are explicit. **Advisory**: quickstart/research examples show `import { h, resolveComponent } from 'vue'` — these are auto-imported in Nuxt 4; implementation must omit those import lines. |
| VI | Component Standards | ✅ PASS | All new components use PascalCase: `GalleryDetail.vue`, `GalleryForm.vue`. Block order (template → script → style) mandated in quickstart checklist. |
| VII | Pinia Setup Stores | ✅ PASS | Store contract uses `defineStore('gallery', () => { ... })` setup pattern exclusively. No options-style stores. |
| VIII | No-Test Policy | ✅ PASS | Zero test files referenced in any artifact. Plan explicitly states "No-Test Policy". |

**Post-design re-evaluation: ALL 8 principles PASS. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/dev/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── app.vue              # Root app with UApp, UContainer, logout button
├── assets/
│   └── css/main.css
├── components/
│   └── PostCard.vue     # Existing card component (may be extended or replaced)
├── composables/
│   └── useGallery.ts    # Gallery data composable (currently mock data)
├── pages/
│   ├── index.vue        # Landing page with marquee gallery preview
│   ├── gallery.vue      # NEW — Public gallery page (browse, detail modal, copy prompt)
│   ├── admin.vue        # NEW — Admin management page (CRUD, image upload, status toggle)
│   ├── login/           # Existing login page
│   └── confirm/         # Existing auth confirm page
└── stores/
    └── galleryStore.ts  # Pinia setup store for gallery items (extend with CRUD actions)

shared/
└── types/
    └── index.d.ts       # GalleryItem global type definition
```

**Structure Decision**: Single Nuxt project (no monorepo). New gallery page and admin page will be added under `app/pages/`. New components under `app/components/`. Extend existing store and composable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.
