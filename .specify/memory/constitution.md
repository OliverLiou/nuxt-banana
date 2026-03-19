<!--
  Sync Impact Report
  ===========================================================================
  Version change: N/A → 1.0.0 (initial creation)

  Modified principles: N/A (new document)

  Added sections:
    - Core Principles (7 principles)
    - Agent Workflow
    - Development Standards
    - Governance

  Removed sections: N/A

  Templates requiring updates:
    - .specify/templates/plan-template.md          ✅ Already aligned
    - .specify/templates/spec-template.md          ✅ Already aligned
    - .specify/templates/tasks-template.md         ✅ Already aligned
    - .specify/templates/checklist-template.md     ✅ Generic, no update needed

  Follow-up TODOs: None
  ===========================================================================
-->

# Nuxt Banana Constitution

## Core Principles

### I. Brownfield Integrity

This project is a brownfield Nuxt 4 application with established
functionality and architecture. All existing behavior, directory
structure, and patterns MUST be preserved.

- Modifying existing features, architecture, or behavior is **strictly
  forbidden** unless the user explicitly grants approval.
- New work MUST integrate within the existing `app/`, `public/`, and
  `shared/` directory structure without introducing new top-level
  folders.
- Any proposed deviation from the current architecture MUST be
  documented and approved before implementation.

### II. Dependency & Version Lock

The project's dependency tree is locked. No external packages may be
added.

- Installing new npm or yarn packages is **strictly forbidden**.
- All code MUST work within the versions locked in `package.json`:
  Nuxt 4, `@nuxt/ui`, `@pinia/nuxt`, TailwindCSS, Vue 3, and
  Vue Router.
- Using experimental syntax or APIs not supported by the current
  locked versions is **forbidden**.

### III. Reuse-First Development

Existing assets MUST be reused before creating new abstractions.

- Auto-imported Nuxt composables (`useRoute()`, `useRouter()`,
  `useFetch()`, `useAsyncData()`, etc.) MUST be used directly
  without redundant imports.
- `@nuxt/ui` components and primitives MUST be the first choice
  for UI before creating custom components.
- When code repetition is detected, the duplicated logic MUST be
  extracted into a reusable composable (`app/composables/`) or
  component (`app/components/`).
  Example: `h(resolveComponent('UButton'), { ... })` →
  extract `const UButton = resolveComponent('UButton')` and reuse.

### IV. TypeScript Strictness

All code MUST comply with TypeScript without errors or warnings.

- The codebase MUST have zero TypeScript errors and zero warnings
  at all times. Exception: errors that resolve after `npm run dev`
  generates runtime types may be temporarily deferred.
- Component props, emit events, Pinia store state, and API response
  data MUST have explicit `interface` or `type` definitions.
- When using `@nuxt/ui` components, type definitions MUST be
  imported from the `@nuxt/ui` module (e.g., `BadgeProps`,
  `ButtonProps`).

### V. Nuxt 4 & Vue Conventions

All code MUST follow Nuxt 4 file-based conventions and Vue 3 best
practices.

- Component files MUST use PascalCase naming
  (e.g., `MyComponent.vue`).
- Pages MUST reside in `app/pages/` and follow Nuxt file-based
  routing conventions (e.g., `pages/index.vue` → `/`,
  `pages/about.vue` → `/about`).
- Vue Single-File Components MUST follow this block order:
  1. `<template>`
  2. `<script setup lang="ts">`
  3. `<style scoped>` (if needed)

### VI. Styling & State Management

Styling and state follow prescribed patterns with no exceptions.

- All styling MUST use TailwindCSS utility classes. Custom CSS is
  permitted only within `<style scoped>` when Tailwind utilities
  are insufficient.
- State management MUST use Pinia with the Setup Store pattern
  (`defineStore` receiving a function), located in `app/stores/`.

### VII. Validation Policy

Every implementation cycle MUST close with a clean validation pass.

- After completing implementation work, all code MUST be checked
  for TypeScript warnings and errors; any introduced issues MUST
  be resolved before the work is considered done.
- Automated unit tests and end-to-end (E2E) tests are **not
  required** unless explicitly requested in a feature specification.
- Validation relies on `npx nuxi prepare`, `npm run build`, manual
  verification, and diagnostic review.

## Agent Workflow

Rules governing AI agent behavior during speckit-driven development.

- During the `speckit-implement` stage, when a task requires
  `@nuxt/ui` components, the agent MUST invoke the **nuxt-ui**
  skill to ensure correct component usage and prop patterns.
- After implementation is complete, the agent MUST run diagnostics
  to confirm no new warnings or errors were introduced.
- The agent MUST NOT install packages, modify locked versions, or
  deviate from the principles above without explicit user approval.

## Development Standards

Operational standards that apply across all development activities.

- Commit after each task or logical group of changes.
- Prefer surgical, minimal changes that fit the existing repository
  structure.
- Document any approved exception to architecture or dependency
  rules before story work begins.
- Use exact repository paths from the approved plan; do not add new
  directories unless the user has approved a brownfield exception.

## Governance

This constitution is the authoritative governance document for the
Nuxt Banana project. It supersedes all other development practices
and conventions when conflicts arise.

- **Amendment procedure**: Any change to this constitution MUST be
  documented with a version bump, a sync impact report, and
  propagation to dependent templates.
- **Versioning policy**: The constitution follows semantic versioning
  (MAJOR.MINOR.PATCH). MAJOR for principle removals or
  redefinitions, MINOR for new principles or material expansions,
  PATCH for clarifications and wording fixes.
- **Compliance review**: All plan documents MUST include a
  Constitution Check gate. All pull requests and code reviews MUST
  verify compliance with these principles.
- **Runtime guidance**: Use `.specify/memory/constitution.md` as
  the single source of truth. The README references this file for
  quick orientation.

**Version**: 1.0.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17
