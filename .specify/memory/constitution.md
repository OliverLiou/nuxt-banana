<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial creation)

Modified principles: N/A (initial creation)

Added sections:
  - Core Principles (8 principles derived from 17 raw rules)
  - Technical Stack
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
    Added Constitution Check items for PascalCase/SFC order and DRY.
  - .specify/templates/spec-template.md ✅ already aligned
  - .specify/templates/tasks-template.md ✅ updated
    Replaced Python paths in Parallel Example with Nuxt/Vue/TS paths.
    Added PascalCase and SFC order to Notes section.
  - .specify/templates/checklist-template.md ✅ already aligned
  - .specify/templates/agent-file-template.md ⚠️ minor gaps
    Missing Testing Policy, PascalCase/SFC, DRY in guidelines (non-blocking).
  - README.md ⚠️ minor gap
    Testing Policy not listed in key rules summary (non-blocking).

Follow-up TODOs:
  - Consider adding Testing Policy to README.md key rules.
  - Consider adding PascalCase/SFC/DRY to agent-file-template.md.
-->

# Nuxt Banana Constitution

## Core Principles

### Principle I: Brownfield Preservation

This project is a brownfield application with established functionality and architecture. Existing code, structure, and behavior MUST NOT be changed unless the user explicitly approves or requests the change. All modifications MUST be scoped to the task at hand and MUST NOT introduce side effects to unrelated features.

### Principle II: Dependency Lock

New npm or yarn packages MUST NOT be installed under any circumstances. The project MUST strictly follow the Nuxt 4 and @nuxt/ui versions locked in `package.json`. Experimental syntax or APIs not supported by the current locked versions MUST NOT be used.

### Principle III: Reuse First

Existing composables MUST be used directly without redundant imports. Nuxt auto-imported composables — such as `useRoute()`, `useRouter()`, `useFetch()`, `useAsyncData()` — MUST be called directly. Existing project components and @nuxt/ui primitives MUST be preferred over creating new ones; reinventing existing functionality is prohibited. During the speckit-implement phase, the `nuxt-ui` skill MUST be invoked when implementing @nuxt/ui-related components.

### Principle IV: TypeScript Discipline

All code in this project MUST conform to TypeScript standards with zero errors and zero warnings. Component props, emit events, Pinia state, and API response data MUST have explicitly defined `interface` or `type` declarations. When using @nuxt/ui components, type definitions MUST be imported from the @nuxt/ui module directly.

### Principle V: Styling & State Conventions

All styling MUST be implemented using TailwindCSS exclusively. State management MUST use Pinia with the Setup Stores pattern — that is, `defineStore` receiving a function (not the options object syntax).

### Principle VI: File & Naming Conventions

Vue component files MUST follow PascalCase naming (e.g., `MyComponent.vue`). Pages MUST reside in the `pages/` directory and MUST follow Nuxt 4 file-based routing conventions for file and folder naming. Vue Single-File Components MUST follow this block order strictly: `<template>` → `<script setup lang="ts">` → `<style scoped>`.

### Principle VII: Code Quality & DRY

When code duplication is detected, the repeated logic MUST be extracted into a reusable composable or component. After each implementation phase, all written code MUST be checked for TypeScript warnings and errors — zero diagnostics issues are required before considering work complete.

### Principle VIII: Testing Policy

Unit tests and end-to-end (E2E) tests are NOT required for this project. Validation is performed via `npx nuxi prepare`, `npm run build`, and manual verification instead.

## Technical Stack

The following technology stack is locked for this project:

- **Framework**: Nuxt 4 (Vue 3)
- **UI Library**: @nuxt/ui
- **Styling**: TailwindCSS
- **State Management**: Pinia (setup stores)
- **Backend**: Supabase (@nuxtjs/supabase)
- **Language**: TypeScript (strict)
- **Build Validation**: `npx nuxi prepare` + `npm run build`

## Development Workflow

- Implementation MUST start with reviewing existing code and identifying reusable patterns.
- Each implementation phase MUST end with diagnostics validation (zero warnings/errors).
- Commit after each task or logical group of changes.
- Use `npx nuxi prepare` and `npm run build` as the validation gate before considering work complete.

## Governance

- This constitution supersedes all other development practices in this repository.
- Amendments require explicit user approval and MUST be documented with a version increment.
- All code changes and reviews MUST verify compliance with these principles.
- Complexity or deviation from principles MUST be justified in a Complexity Tracking table.
- Use `.specify/sdd-docs/constitution.md` as the raw source of development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-13
