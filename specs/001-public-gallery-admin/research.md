# Phase 0 Research: Public Gallery and Admin Management

## Authentication and Access

- **Decision:** Keep `/login` as the explicit administrator sign-in entry and keep `/confirm` as
  the Supabase callback route.
  **Rationale:** `nuxt.config.ts` already reserves these paths, and the feature needs only a
  minimal login entry to support protected admin access.
  **Alternatives considered:** Renaming the callback route, or auto-sending unauthorized admin
  visits straight to `/login`.

- **Decision:** Remove `useUserStore()` from `app.vue` and replace it with a dedicated
  `app/stores/auth.store.ts` plus a small `useAuthAccess()` composable.
  **Rationale:** The current file references a missing store, and the user explicitly directed
  the plan to drop `useUserStore()` in favor of the plan-phase auth logic.
  **Alternatives considered:** Restoring the deleted user store contract, or duplicating the
  Supabase session in Pinia.

- **Decision:** Protect only `app/pages/admin/**` with a named `auth` middleware that first
  checks `useSupabaseSession()`, then an admin role derived from the existing Supabase
  `profiles` authorization source, and redirects failures to `/`.
  **Rationale:** The public gallery must stay fully open, while admin reads and writes need both
  client-side gating and server-side authorization alignment.
  **Alternatives considered:** Global middleware, treating every signed-in user as admin, or
  relying only on client checks.

- **Decision:** Treat the Supabase session as the authentication source of truth and keep the
  Pinia store limited to derived authorization state such as `role`, `roleLoaded`,
  `isAuthenticated`, and `isAdmin`.
  **Rationale:** Supabase already persists the session and callback state; the app only needs a
  shared place for admin-role hydration and guarded navigation.
  **Alternatives considered:** Full auth persistence in Pinia or repeated per-page role fetches.

## Public Gallery Experience

- **Decision:** Build the hero with `UPageCTA` plus `UMarquee`, but keep it inside the existing
  `UContainer` and derive featured content from the three most recent gallery items with
  `isActive = true`.
  **Rationale:** This keeps the implementation aligned with `.specify/sdd-docs/plan.md` without
  introducing schema changes or a separate featured flag.
  **Alternatives considered:** A static hero without featured media, or a manually curated
  featured field.

- **Decision:** Use TailwindCSS responsive layout and existing Nuxt/UI composition to switch the
  marquee arrangement instead of adding `@vueuse/core`.
  **Rationale:** The constitution forbids new packages, and the layout differences can be handled
  within the current dependency set.
  **Alternatives considered:** Adding `@vueuse/core` for window-size helpers, or dropping the
  marquee entirely.

- **Decision:** Query public content from `gallery_items` with `isActive = true`, ordered by
  `created_at` descending, and reuse that data for both the hero and gallery grid.
  **Rationale:** This matches the feature spec, the shared `GalleryItem` type, and the planning
  input in `.specify/sdd-docs/plan.md`.
  **Alternatives considered:** Separate hero and grid queries, manual featured storage, or
  exposing records with `isActive = false`.

- **Decision:** Render gallery browsing inside `UScrollArea` with `UBlogPost` cards and a shared
  selected-item state for the detail modal.
  **Rationale:** This stays close to the requested plan shape while keeping the public gallery in
  one route and preserving user context.
  **Alternatives considered:** Numbered pagination, route-driven detail pages, or a pure custom
  card stack.

- **Decision:** Use `UModal` for detail view, `navigator.clipboard` plus `useToast()` for prompt
  copy feedback, and Nuxt/UI state components for loading, empty, and failure states.
  **Rationale:** These behaviors directly satisfy the feature spec and remain fully compatible
  with `@nuxt/ui` 4.4.0 and the existing `UApp` wrapper.
  **Alternatives considered:** Inline detail expansion, browser alerts, or spinner-only loading.

- **Decision:** Use `isActive` and `badges` as the canonical field terminology across planning,
  contracts, and implementation artifacts.
  **Rationale:** The shared type already defines these field names, and consistent terminology
  removes translation drift between the spec, plan, tasks, and implementation.
  **Alternatives considered:** Keeping dual wording instead of a single canonical vocabulary, or
  renaming the schema now.

## Admin CRUD and Submission Flow

- **Decision:** Use `UTable` for the admin list, with thumbnail, title, truncated prompt,
  created date, `isActive` status, badge summary, and row actions.
  **Rationale:** This aligns with `.specify/sdd-docs/plan.md` while keeping the management view
  dense and scan-friendly.
  **Alternatives considered:** Card-based admin layouts or full prompt content in the main grid.

- **Decision:** Use a page-controlled `USlideover` for create and edit, and reserve `UModal` for
  destructive delete confirmation only.
  **Rationale:** Slideover preserves table context and supports a longer multi-field editor
  better than a general modal.
  **Alternatives considered:** Editing inside a modal or in a dedicated route.

- **Decision:** Model admin form state separately from persisted `GalleryItem` data as:
  `id?`, `title`, `prompt`, `badges`, `isActive`, `existingImageUrl`, and `uploadImage`.
  **Rationale:** This keeps transient upload state separate from persisted gallery data and avoids
  mutating shared records directly.
  **Alternatives considered:** Deep-copying `GalleryItem` directly or maintaining divergent
  create/edit shapes.

- **Decision:** Use `UForm :validate` with explicit mode-aware rules and no new validation
  package. Create mode requires a new image, title, and prompt. Edit mode requires title,
  prompt, and either the existing image URL or a replacement upload. Badges remain optional, but
  each badge row must contain a non-empty label and valid color.
  **Rationale:** This resolves the deferred clarification from the clarify phase, honors the
  feature spec, and stays within the current dependency policy.
  **Alternatives considered:** Schema-library validation, requiring at least one badge, or using
  identical rules for create and edit.

- **Decision:** Constrain uploads to `.webp` files under 2 MB through `UFileUpload` configuration
  and submit in this order: validate, upload if needed, fetch public URL, insert/update DB row,
  refresh list.
  **Rationale:** This preserves the planning intent in `.specify/sdd-docs/plan.md` and enforces
  the spec requirement that the database write must never continue without a usable public URL.
  **Alternatives considered:** Writing the database first, or relying only on visual upload
  constraints without submit-time guards.

- **Decision:** If a file upload succeeds but the public URL or database write fails, abort the
  save, show an error toast, and clean up the just-uploaded storage object before returning
  control to the form.
  **Rationale:** This is the safest interpretation of the feature’s critical blocking rule and
  avoids leaving orphaned uploads from failed mutations.
  **Alternatives considered:** Leaving uploaded files behind, or swallowing the failure and
  saving partial data.

- **Decision:** Delete operations remove the `gallery_items` row only; storage cleanup is deferred
  unless an existing storage-key field is already available during implementation.
  **Rationale:** The feature spec requires guarded deletion of gallery data, but it does not
  require storage lifecycle management or expose a persisted storage key today.
  **Alternatives considered:** Mandatory storage deletion in the same action, or blocking delete
  until a new storage contract is introduced.

- **Decision:** Use `useToast()` for create, update, delete, and upload/public-URL failures, and
  use `useOverlay()` or `UModal` for explicit delete confirmation that includes the target title.
  **Rationale:** `app.vue` already mounts `UApp`, so these overlays are available and consistent
  with the requested admin UX.
  **Alternatives considered:** Inline banners only or browser-native `window.confirm`.

## Technical Baseline Notes

- **Decision:** Restore `app/types/database.types.ts` before implementation begins.
  **Rationale:** `nuxt.config.ts` already references this path, and typed Supabase queries are
  required for the planned brownfield-safe implementation.
  **Alternatives considered:** Ignoring the missing types file or weakening type safety.

- **Decision:** Treat the current empty `app/pages/index.vue` and the stale `specs/dev` planning
  output as baseline cleanup context, not as part of the feature contract.
  **Rationale:** The active feature artifacts live under `specs/001-public-gallery-admin`, while
  the plan setup script followed the `dev` branch because feature branch creation was skipped.
  **Alternatives considered:** Reusing `specs/dev` as the feature source of truth.
