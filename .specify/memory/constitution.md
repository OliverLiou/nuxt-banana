<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 (template) → 1.0.0 (initial population)
  Bump rationale: MAJOR — first population of constitution from template

  Principles added (8):
    I.   Brownfield Preservation (NON-NEGOTIABLE)
    II.  Dependency Lock (NON-NEGOTIABLE)
    III. UI-First Development
    IV.  TypeScript Strictness
    V.   Nuxt Auto-Import Convention
    VI.  Component Standards
    VII. Pinia Setup Stores
    VIII.No-Test Policy

  Sections added:
    - Technology Stack
    - Development Workflow

  Sections removed: none
  Principles removed: none

  Template consistency:
    ✅ plan-template.md     — Compatible, no changes needed
    ✅ spec-template.md     — Compatible, no changes needed
    ✅ tasks-template.md    — Compatible (tests already OPTIONAL)
    ✅ checklist-template.md — Compatible, no changes needed
    ✅ README.md            — Compatible, no changes needed

  Deferred items: none
  Follow-up TODOs: none
-->

# nuxt-banana Constitution

## Core Principles

### I. Brownfield Preservation (NON-NEGOTIABLE)

This is a brownfield project with existing functionality and architecture.
Existing architecture, file structure, and working code MUST NOT be altered
without explicit user permission. All changes MUST be additive or surgical
modifications scoped to the current task.

### II. Dependency Lock (NON-NEGOTIABLE)

Installing new npm or yarn packages is strictly forbidden. All code MUST
use only dependencies already present in `package.json`. Development MUST
strictly follow the Nuxt 4 and @nuxt/ui versions locked in `package.json`.
Using experimental syntax unsupported by the current versions is forbidden.

### III. UI-First Development

Features MUST prefer existing component libraries and @nuxt/ui components.
Reinventing UI primitives that already exist is forbidden. Styling MUST
use TailwindCSS as the primary approach. When implementing @nuxt/ui
components, the `nuxt-ui` skill MUST be invoked for guidance.

### IV. TypeScript Strictness

All code MUST be valid TypeScript with zero type errors. Component Props,
Emit Events, Pinia State, and API Response Data MUST have explicit
`interface` or `type` definitions. Types for @nuxt/ui components MUST be
imported from the `@nuxt/ui` module directly.

### V. Nuxt Auto-Import Convention

Nuxt auto-imported composables (e.g., `useRoute()`, `useRouter()`,
`useFetch()`, `useAsyncData()`) MUST be used directly without redundant
import statements. Manual imports of auto-provided APIs are forbidden.

### VI. Component Standards

Components MUST use PascalCase naming (e.g., `MyComponent.vue`).
Vue SFC files MUST follow this strict block ordering:
1. `<template>` block
2. `<script setup lang="ts">` block
3. `<style scoped>` block (if needed)

### VII. Pinia Setup Stores

Global state management MUST use Pinia with the Setup Store pattern
(i.e., `defineStore` receiving a function). Options-style stores MUST NOT
be used for new state definitions.

### VIII. No-Test Policy

This project does not require unit tests or end-to-end (E2E) tests.
Test files MUST NOT be generated unless explicitly requested by the user.

## Technology Stack

- **Framework**: Nuxt 4.3+
- **UI Library**: @nuxt/ui v4.4+
- **View Layer**: Vue 3 (Composition API, `<script setup>`)
- **Styling**: TailwindCSS 4
- **State Management**: Pinia (Setup Stores)
- **Backend / Auth**: Supabase
- **Language**: TypeScript (strict)

## Development Workflow

- When implementing @nuxt/ui components, the `nuxt-ui` skill MUST be
  invoked to ensure correct API usage and theming patterns.
- When editing `.vue` files or creating Vue 3 composables, the `vue`
  skill SHOULD be used for Composition API best practices.
- All code changes MUST be reviewed for compliance with this constitution
  before being committed.
- Vue SFC block ordering (template → script → style) MUST be enforced
  in every `.vue` file touched during a change.

## Governance

- This constitution supersedes all other development practices and
  conventions for the nuxt-banana project.
- Amendments to this constitution require explicit user approval,
  consistent with the brownfield preservation principle.
- Compliance with all principles MUST be verified in every code change.
- The raw source principles are maintained in
  `.specify/sdd-docs/constitution.md` as the authoritative reference.

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
