# nuxt-banana Development Guidelines

Auto-generated from `.specify/memory/constitution.md` and active feature plans.
Last updated: 2026-03-13

## Constitution Compliance

- Treat the repository as brownfield; do not alter existing architecture or behavior without
  explicit approval.
- Reuse existing Nuxt composables, local components, and `@nuxt/ui` primitives before adding
  new abstractions.
- Keep route files in `app/pages/`, style with TailwindCSS, and use Pinia setup stores for
  shared state.
- Maintain explicit TypeScript contracts for props, emits, state, and API data, and finish
  work with no unresolved diagnostics.
- Do not add new packages or unsupported experimental syntax.
- When agent-driven work implements `@nuxt/ui` components, use the `nuxt-ui` skill.

## Active Technologies

- TypeScript 5.x, Nuxt 4.3.1, Vue 3.5.x
- `@nuxt/ui` 4.4.0, `@nuxtjs/supabase` 2.0.3, `@pinia/nuxt` 0.11.3, TailwindCSS 4.1.18
- Supabase Postgres (`gallery_items`, `profiles`) and Supabase Storage for gallery images

## Project Structure

```text
app/
├── app.vue
├── assets/
├── components/
├── composables/
├── middleware/
├── pages/
├── stores/
└── types/

public/
shared/
└── types/

specs/
└── 001-public-gallery-admin/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

## Commands

- `npm install`
- `npx nuxi prepare`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Code Style

- Treat the repo as brownfield and keep changes surgical.
- Keep routes in `app/pages/` and shared state in Pinia setup stores.
- Reuse Nuxt composables and existing `@nuxt/ui` primitives before creating new abstractions.
- Use TailwindCSS for styling and explicit TypeScript types for props, emits, state, and API data.
- Do not add new packages or unsupported experimental syntax.
- Keep public-facing wording `published`/`labels` mapped to stored fields `isActive`/`badges`.

## Recent Changes

- 001-public-gallery-admin: Planned a public gallery, admin dashboard, and minimal auth/callback
  flow using Nuxt UI, Supabase, and Pinia within the existing brownfield structure.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
