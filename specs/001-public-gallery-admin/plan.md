# Implementation Plan: Public Gallery and Admin Management

**Branch**: `001-public-gallery-admin` | **Date**: 2026-03-13 | **Spec**: `C:\Users\b00003\Documents\Projects\Olivers\nuxt-banana\specs\001-public-gallery-admin\spec.md`
**Input**: Feature specification from `/specs/001-public-gallery-admin/spec.md`

**Note**: This plan follows `.specify/memory/constitution.md` and uses
`.specify/sdd-docs/plan.md` as implementation guidance while correcting conflicts with the
formal spec, current dependencies, and the brownfield repository structure.

## Summary

Implement a responsive public gallery and protected admin workspace in the existing Nuxt 4 SPA.
The plan adds the missing Google sign-in entry and callback flow for administrators, removes the
current `app.vue` dependency on `useUserStore()` per user direction, and replaces it with a
feature-scoped auth store plus middleware. Public gallery data will be sourced from
`isActive = true` Supabase records and reused across the hero, marquee, gallery grid, and detail modal. Admin
work will use `@nuxt/ui` table, slideover, form, modal, and toast patterns to manage gallery
items, with a hard stop when image upload cannot produce a usable public URL.

## Technical Context

**Language/Version**: TypeScript 5.x, Nuxt 4.3.1, Vue 3.5.x  
**Primary Dependencies**: Nuxt 4, `@nuxt/ui` 4.4.0, `@nuxtjs/supabase` 2.0.3,
`@pinia/nuxt` 0.11.3, TailwindCSS 4.1.18  
**Storage**: Supabase Postgres (`gallery_items`, `profiles`) and Supabase Storage for gallery
images  
**Testing**: Manual scenario validation plus `npx nuxi prepare` and `npm run build`; automated
tests remain out of scope unless explicitly added later  
**Target Platform**: Browser-based Nuxt 4 SPA with responsive desktop, tablet, and mobile
layouts  
**Project Type**: Brownfield Nuxt 4 app rooted in `app/`, `public/`, and `shared/`  
**Performance Goals**: Keep initial public rendering responsive, maintain smooth gallery and
modal interactions for tens to low hundreds of items, and degrade gracefully on image or data
fetch failures  
**Constraints**: No new packages; remove `useUserStore()` from `app.vue`; use `useSupabaseClient`,
`useSupabaseSession`, `useAsyncData`, and Pinia setup stores; style with TailwindCSS and
`@nuxt/ui`; keep explicit TypeScript types; use canonical field terminology `isActive` and
`badges` consistently across the feature artifacts  
**Scale/Scope**: Add only the pages, middleware, store, composables, types, and components
needed for login, confirm callback, public gallery, and admin management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- [x] Brownfield boundary is defined: update `app/app.vue`, `app/pages/index.vue`, and add only
      feature-specific files under existing `app/pages/`, `app/components/`, `app/composables/`,
      `app/middleware/`, `app/stores/`, and `app/types/`.
- [x] Existing reuse candidates are identified: `useSupabaseClient()`, `useSupabaseSession()`,
      `useSupabaseUser()`, `useAsyncData()`, shared `GalleryItem`, and `@nuxt/ui` primitives
      including `UAuthForm`, `UPageCTA`, `UMarquee`, `UBlogPost`, `UScrollArea`, `UModal`,
      `UTable`, `USlideover`, `UForm`, `UFileUpload`, `UBadge`, `USwitch`, `useToast`, and
      `useOverlay`.
- [x] Route, styling, and state changes stay within `app/pages/`, TailwindCSS, and Pinia
      setup-store conventions.
- [x] TypeScript contract updates are identified for auth state, middleware checks, public
      gallery view models, admin form state, badge rows, and Supabase row mapping.
- [x] Validation covers diagnostics plus `npx nuxi prepare` and `npm run build`; automated tests
      remain intentionally omitted because the project does not require them.
- [x] No new packages or version-incompatible syntax are required.

### Post-Design Re-check

- [x] Hero, marquee, gallery grid, modal, table, slideover, and form patterns all stay within
      `@nuxt/ui` 4.4.0 and TailwindCSS.
- [x] Responsive behavior is achieved with Nuxt/UI and Tailwind layout choices, not with a new
      helper package such as `@vueuse/core`.
- [x] Auth design removes `useUserStore()` from `app.vue` and replaces it with a dedicated
      `auth.store.ts`, named middleware, and Supabase-session-derived role checks.
- [x] Admin validation uses `UForm :validate` and explicit local types, avoiding new schema
      libraries.
- [x] The plan restores `app/types/database.types.ts` so the existing Supabase config remains
      type-safe.
- [x] No constitution exception remains unresolved.

**Gate Status**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-public-gallery-admin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-gallery-management.md
│   ├── auth-access.md
│   └── public-gallery.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── app.vue
├── components/
│   ├── admin/
│   │   ├── AdminGalleryFormSlideover.vue
│   │   ├── AdminGalleryTable.vue
│   │   └── BadgeRepeater.vue
│   ├── auth/
│   │   └── LoginAuthForm.vue
│   └── gallery/
│       ├── GalleryDetailModal.vue
│       ├── GalleryGrid.vue
│       ├── GalleryHero.vue
│       └── GalleryMarquee.vue
├── composables/
│   ├── useAdminGallery.ts
│   ├── useAuthAccess.ts
│   └── usePublicGallery.ts
├── middleware/
│   └── auth.ts
├── pages/
│   ├── admin/
│   │   └── index.vue
│   ├── confirm/
│   │   └── index.vue
│   ├── login/
│   │   └── index.vue
│   └── index.vue
├── stores/
│   └── auth.store.ts
└── types/
    └── database.types.ts

public/
shared/
└── types/
    └── index.d.ts
```

**Structure Decision**: Keep all new work inside the existing `app/` and `shared/` structure.
Use feature-scoped components and composables for reuse, keep the shared `GalleryItem` shape as
the canonical persisted gallery type, and add only one new local store for derived auth and
authorization state.

## Complexity Tracking

No constitution violations or brownfield exceptions require justification at planning time.
