# Nuxt Banana

Nuxt Banana is a brownfield Nuxt 4 application built with Vue 3, `@nuxt/ui`, TailwindCSS,
Pinia, and Supabase.

## Project Constitution

Development work in this repository MUST follow `.specify/memory/constitution.md`.

Key rules:
- preserve existing brownfield behavior unless the user explicitly approves a change
- do not install new npm or yarn packages
- reuse existing composables, local components, and `@nuxt/ui` primitives first
- keep styling in TailwindCSS and shared state in Pinia setup stores
- maintain explicit TypeScript types and close work with no unresolved diagnostics

## Setup

Install dependencies with npm:

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

## Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```
