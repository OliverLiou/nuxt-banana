<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles:
- Template principle slot 1 -> I. Brownfield Preservation
- Template principle slot 2 -> II. Nuxt-Native Reuse
- Template principle slot 3 -> III. Typed Contracts First
- Template principle slot 4 -> IV. Nuxt 4 Structure and UI Consistency
- Template principle slot 5 -> V. Dependency and Version Discipline
Added sections:
- Project Constraints
- Delivery Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/agent-file-template.md
Runtime guidance synchronized:
- ✅ README.md
Reviewed without change:
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/constitution-template.md
Command template review:
- ⚠ .specify/templates/commands/*.md (directory not present; no command files required updates)
Follow-up TODOs:
- None
-->
# Nuxt Banana Constitution

## Core Principles

### I. Brownfield Preservation
- This repository MUST be treated as a brownfield codebase. Existing features, architecture,
  and file organization MUST NOT be changed unless the user explicitly approves the change.
- Contributors MUST prefer the smallest safe change surface and preserve current behavior
  while extending the system.

Rationale: Controlled change protects existing flows and reduces regression risk in an
already-working application.

### II. Nuxt-Native Reuse
- Existing Nuxt composables and auto-imported utilities, including `useRoute()`,
  `useRouter()`, `useFetch()`, and `useAsyncData()`, MUST be used directly when they satisfy
  the need.
- Contributors MUST reuse existing local components and `@nuxt/ui` components before creating
  new abstractions.
- Repeated logic or repeated render patterns MUST be extracted into reusable composables or
  components instead of duplicated inline.

Rationale: Reuse keeps the brownfield app consistent and prevents parallel implementations of
the same concept.

### III. Typed Contracts First
- All committed code MUST remain free of TypeScript errors and warnings.
- Component props, emitted events, Pinia state, and API response data MUST use explicit
  `interface` or `type` declarations.
- When `@nuxt/ui` types are needed, they MUST be imported from the `@nuxt/ui` module instead
  of redeclared locally.

Rationale: Explicit typing preserves DX, prevents drift between UI and data contracts, and
keeps refactors safe.

### IV. Nuxt 4 Structure and UI Consistency
- Route files MUST live under `app/pages/` and follow Nuxt file-based routing conventions.
- Vue single-file components MUST be ordered as `<template>`, `<script setup lang="ts">`, and
  `<style scoped>` when a style block is needed.
- Styling MUST use TailwindCSS and existing `@nuxt/ui` primitives or themes rather than
  introducing parallel styling systems.
- Shared client state MUST use Pinia setup stores (`defineStore(id, () => {})`).

Rationale: Consistent structure and UI patterns make the codebase predictable for every
follow-on feature.

### V. Dependency and Version Discipline
- Contributors MUST NOT install new npm or yarn packages unless the constitution is formally
  amended and the user explicitly approves the exception.
- Changes MUST stay within the Nuxt 4 and `@nuxt/ui` versions locked in `package.json`.
- Unsupported experimental syntax or APIs for the locked versions MUST NOT be introduced.

Rationale: Stable dependencies and version-compatible code keep delivery predictable in this
constrained environment.

## Project Constraints

- Plans, specs, and tasks MUST assume a Nuxt 4 application rooted in `app/`, `public/`, and
  `shared/`.
- Automated unit and E2E tests are optional by default in this project. They MUST only be
  added when explicitly requested or when no safer verification path exists for the changed
  behavior.
- When an implementation task uses `@nuxt/ui` components through an agent workflow, the
  `nuxt-ui` skill MUST be invoked.
- Final deliverables MUST include a warning or error review. If Nuxt-generated types are
  required to clear diagnostics, contributors MUST run the existing Nuxt preparation or build
  flow before declaring the work complete.

Rationale: These constraints encode the project-specific operating rules that every
implementation plan must respect.

## Delivery Workflow

- Every plan MUST record the brownfield boundary, the reuse candidates being leveraged, and
  whether any exception to package or architecture rules is requested.
- Every task list MUST use concrete repository paths and include work for reusable extraction
  when duplication appears.
- Every implementation review MUST confirm TailwindCSS usage, Pinia setup-store compliance for
  shared state, and explicit type coverage for props, emits, state, and API data.
- Any requested exception MUST be documented in the relevant plan or review and approved by
  the user before code is merged or handed off.

Rationale: The workflow turns the constitution into repeatable review gates instead of passive
documentation.

## Governance

- This constitution is the authoritative development policy for the repository. When guidance
  in plans, tasks, README content, or agent context conflicts with this document, this
  document takes precedence.
- Any amendment MUST update this file, include a Sync Impact Report, and synchronize all
  affected templates and runtime guidance in the same change.
- Versioning follows semantic versioning for governance: MAJOR for removing or redefining a
  principle in a backward-incompatible way, MINOR for new principles or materially expanded
  obligations, and PATCH for clarifications or editorial refinements.
- Compliance review is mandatory at planning, task generation, implementation, and final
  handoff. Reviews MUST verify brownfield protection, reuse, typed contracts, UI/state
  consistency, dependency discipline, and final diagnostics closure.
- The source requirements captured in `.specify/sdd-docs/constitution.md` may inform future
  amendments, but this file is the binding constitution once ratified.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
