# Quickstart: Gallery Management Feature

**Branch**: `dev` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

---

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | LTS recommended |
| Nuxt | 4.3+ | Already in `package.json` |
| @nuxt/ui | v4.4+ | Already in `package.json` |
| @nuxtjs/supabase | v2.0.3 | Already in `package.json` |
| @pinia/nuxt | v0.11.3 | Already in `package.json` |
| TailwindCSS | 4 | Already in `package.json` |

### Supabase Environment

Create a `.env` file at the project root (if not already present):

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-anon-public-key>
```

The Supabase project must have:
- A `gallery_items` table (see [data-model.md](data-model.md) for schema)
- A public Storage bucket named `images`

> **Dependency Lock Policy**: All dependencies are already installed. **Do not** run `npm install <new-package>`. Use only what's in `package.json`.

---

## 2. Project Overview

### What We're Building

A Gallery Management system with two surfaces:
1. **Public gallery page** (`/gallery`) — visitors browse active artwork with infinite scroll, view details in a modal, and copy prompts
2. **Admin management page** (`/admin/gallery`) — authenticated admins perform CRUD operations (create, edit, delete, toggle status) with image upload to Supabase Storage

### Architecture

```
Browser (Nuxt 4 SPA, ssr: false)
  ├── @nuxt/ui v4 components (UBlogPost, UTable, UForm, USlideover, etc.)
  ├── Pinia setup stores (state management)
  └── Supabase Client (auto-imported via @nuxtjs/supabase)
        ├── PostgreSQL (gallery_items table)
        └── Storage (images bucket)
```

### Key Conventions (from Constitution)

| # | Principle | Rule |
|---|---|---|
| I | **Brownfield Preservation** | All changes are **additive**. Never modify existing working code without explicit permission. |
| II | **Dependency Lock** | No new npm packages. Use only what's in `package.json`. |
| III | **UI-First** | Use @nuxt/ui components. Invoke the `nuxt-ui` skill when implementing them. |
| IV | **TypeScript Strict** | All code must be valid TS with explicit `interface`/`type` definitions. |
| V | **Auto-Imports** | Use Nuxt auto-imports (`useRoute`, `useFetch`, `ref`, `computed`, etc.) — no manual imports for these. |
| VI | **Component Standards** | PascalCase filenames. SFC block order: `<template>` → `<script setup lang="ts">` → `<style scoped>`. |
| VII | **Pinia Setup Stores** | Use `defineStore` with a setup function. No options-style stores. |
| VIII | **No-Test Policy** | Do not generate test files unless explicitly requested. |

---

## 3. Development Setup

```bash
# Start the dev server
npm run dev
```

That's it. No additional dependencies to install.

- **Supabase Dashboard**: Use the Supabase web console to manage your database schema, storage buckets, and RLS policies
- **Nuxt DevTools**: Enabled in `nuxt.config.ts` — access via `/__nuxt_devtools__` in browser for component inspection, Pinia state, and route debugging
- **Language**: All UI text is in Traditional Chinese (繁體中文)

---

## 4. File Structure

### New Files to Create

```
app/
├── pages/
│   ├── gallery.vue              # Public gallery page (infinite scroll, UBlogPost cards)
│   └── admin/
│       └── gallery.vue          # Admin CRUD management page (UTable + USlideover)
├── components/
│   ├── GalleryDetail.vue        # Detail modal overlay (full image, badges, prompt, copy)
│   └── GalleryForm.vue          # Admin form inside USlideover (UForm + UFileUpload)
└── composables/
    └── useGalleryAdmin.ts       # Admin CRUD operations composable (Supabase queries)
```

### Existing Files to Extend

```
app/
├── stores/
│   └── galleryStore.ts          # Add CRUD actions, admin state, pagination state
├── composables/
│   └── useGallery.ts            # Replace mock data with real Supabase queries + pagination
shared/
└── types/
    └── index.d.ts               # Extend GalleryItem interface if needed (already well-defined)
```

### Existing Files (Read-Only Context)

| File | Purpose | Key Patterns to Follow |
|---|---|---|
| `app/app.vue` | Root: `<UApp>` + `<UContainer>` + logout button | `useSupabaseClient()`, `useSupabaseUser()` |
| `app/pages/index.vue` | Landing page with marquee gallery preview | `useGallery()` composable usage, `computed()` patterns |
| `app/components/PostCard.vue` | Existing card component | `defineProps<{}>`, `defineEmits<{}>`, badge rendering with `UBadge` |

---

## 5. Implementation Order

Work through these in sequence. P1 features first, then P2.

### Phase A — Foundation (P1)

**Step 1: Extend types and store**
- Review `GalleryItem` in `shared/types/index.d.ts` (already complete with `id`, `image_url`, `title`, `prompt`, `badges`, `created_at`, `isActive`)
- Add form state types (e.g., `GalleryFormState` with `upload_image?: File`)
- Extend `galleryStore.ts` with CRUD actions and pagination state

**Step 2: Public gallery page** — `app/pages/gallery.vue`
- `UScrollArea` with responsive orientation (`vertical` on md+, `horizontal` on mobile)
- `UBlogPost` cards mapping GalleryItem fields (title, prompt as description, image_url, created_at, badges via `#badge` slot)
- Empty state when no active items
- Infinite scroll using VueUse `useInfiniteScroll` + Supabase `.range()`

**Step 3: Detail modal** — `app/components/GalleryDetail.vue`
- `UModal` overlay showing full image, title, all badges, date, full prompt text
- Scroll position preservation on close

### Phase B — Admin Core (P1)

**Step 4: Admin list page** — `app/pages/admin/gallery.vue`
- `UTable` with TanStack `ColumnDef` columns (image thumbnail, title, prompt truncated, date, isActive toggle via `USwitch`, badges, action buttons)
- "Add New" button to open `USlideover`
- Inline `USwitch` status toggle with Supabase update + toast

**Step 5: Admin form** — `app/components/GalleryForm.vue`
- `USlideover` containing `UForm` with custom validation function
- Fields: image (preview or `UFileUpload`), title (`UInput`), prompt (`UTextarea`), isActive (`USwitch`), badges (add/remove list)
- Shared for both create and edit modes

### Phase C — Completion (P1 + P2)

**Step 6: Image upload** — in `useGalleryAdmin.ts`
- Upload to Supabase Storage `images` bucket
- Get public URL via `getPublicUrl()`
- Abort form submission if upload fails

**Step 7: Copy prompt** (P2) — in `GalleryDetail.vue` + gallery page footer
- `navigator.clipboard.writeText()` with `useToast()` success feedback

**Step 8: Delete with confirmation** (P2)
- Confirmation dialog before permanent deletion
- Toast notification on success/failure

---

## 6. Key Patterns

### Supabase Client Usage

The client is auto-imported via `@nuxtjs/supabase`. No manual import needed.

```ts
// Available anywhere in composables/pages/components
const supabase = useSupabaseClient()

// Query example
const { data, error } = await supabase
  .from('gallery_items')
  .select('*')
  .eq('isActive', true)
  .order('created_at', { ascending: false })
  .range(0, 11)
```

### Toast Notifications

Requires `<UApp>` in root (already present in `app.vue`).

```ts
const toast = useToast()

// Success
toast.add({ title: '項目已新增', color: 'success', icon: 'i-lucide-check-circle' })

// Error
toast.add({ title: '操作失敗', description: err.message, color: 'error', icon: 'i-lucide-x-circle' })

// Copy success
toast.add({ title: '複製成功', color: 'success', icon: 'i-lucide-check' })
```

### UForm Custom Validation

This feature uses a custom validation function (not schema-based) to handle create vs. edit mode differences.

```ts
import type { FormError } from '@nuxt/ui'

function validate(state: Partial<GalleryFormState>): FormError[] {
  const errors: FormError[] = []

  if (isEditMode.value) {
    if (!state.image_url) errors.push({ name: 'image_url', message: '圖片為必填' })
  } else {
    if (!state.upload_image) errors.push({ name: 'upload_image', message: '請上傳圖片' })
  }
  if (!state.title?.trim()) errors.push({ name: 'title', message: '標題為必填' })
  if (!state.prompt?.trim()) errors.push({ name: 'prompt', message: '提示詞為必填' })
  if (!state.badges?.length) errors.push({ name: 'badges', message: '至少需要一個標籤' })

  return errors
}
```

```vue
<UForm :validate="validate" :state="formState" @submit="onSubmit">
  <UFormField name="title" label="標題" required>
    <UInput v-model="formState.title" />
  </UFormField>
</UForm>
```

### UBlogPost Card Mapping

```vue
<UBlogPost
  :title="item.title"
  :description="item.prompt"
  :date="formatDate(item.created_at)"
  :image="item.image_url"
  orientation="vertical"
  variant="outline"
>
  <template #badge>
    <UBadge
      v-for="badge in item.badges"
      :key="badge.label"
      :label="badge.label"
      :color="badge.color"
      variant="outline"
    />
  </template>
  <template #footer>
    <UButton
      icon="i-lucide-copy"
      label="複製提示詞"
      variant="ghost"
      size="sm"
      @click="copyPrompt(item.prompt)"
    />
  </template>
</UBlogPost>
```

### UTable Column Definitions (Admin)

Columns use TanStack Table `ColumnDef` with Vue `h()` for custom cell rendering:

```ts
import { h, resolveComponent } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

const columns: ColumnDef<GalleryItem>[] = [
  {
    accessorKey: 'image_url',
    header: '圖片',
    cell: ({ row }) => h('img', {
      src: row.original.image_url,
      class: 'w-16 h-16 object-cover rounded',
      onError: (e: Event) => {
        (e.target as HTMLImageElement).src = '/placeholder.png'
      }
    })
  },
  {
    accessorKey: 'isActive',
    header: '啟用',
    cell: ({ row }) => h(resolveComponent('USwitch'), {
      modelValue: row.original.isActive,
      'onUpdate:modelValue': (val: boolean) => toggleActive(row.original.id, val)
    })
  },
  // ... see research.md R-003 for full column definitions
]
```

### Image Upload to Supabase Storage

```ts
async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `nbp-${Date.now()}.${fileExt}`
  const filePath = `gallery/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    toast.add({ title: '圖片上傳失敗', description: uploadError.message, color: 'error' })
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### Infinite Scroll with UScrollArea

```ts
const PAGE_SIZE = 12
const page = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const scrollAreaRef = useTemplateRef('scrollArea')

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true

  const from = page.value * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('isActive', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!error && data) {
    items.value.push(...data)
    hasMore.value = data.length === PAGE_SIZE
    page.value++
  }
  loading.value = false
}

// VueUse infinite scroll targeting ScrollArea viewport
useInfiniteScroll(
  () => scrollAreaRef.value?.$el?.querySelector('[data-reka-scroll-area-viewport]'),
  () => loadMore(),
  { distance: 200 }
)
```

### Pinia Setup Store Pattern

Follow the existing pattern in `galleryStore.ts`:

```ts
import { defineStore } from 'pinia'

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref<GalleryItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  // Add new actions here using the same pattern
  function addItem(item: GalleryItem) {
    items.value.unshift(item)
  }

  function removeItem(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, pending, error, addItem, removeItem /* ... */ }
})
```

---

## 7. Constitution Compliance Checklist

Run through this before every commit:

- [ ] **Brownfield**: No existing files broken or restructured — changes are additive only
- [ ] **Dependency Lock**: No new packages added to `package.json`
- [ ] **UI-First**: All UI built with @nuxt/ui components (invoked `nuxt-ui` skill for guidance)
- [ ] **TypeScript**: Zero type errors, all props/state/responses have explicit types
- [ ] **Auto-Imports**: No manual imports for Nuxt composables (`ref`, `computed`, `useRoute`, etc.)
- [ ] **Component Standards**: PascalCase filenames, `<template>` → `<script setup lang="ts">` → `<style scoped>` order
- [ ] **Pinia Setup Stores**: Uses `defineStore` with setup function pattern
- [ ] **No Tests**: No test files generated
- [ ] **Block order**: Every `.vue` file follows template → script → style
- [ ] **Toast feedback**: All CRUD operations show success/error notifications
- [ ] **Form validation**: Custom validation function handles create vs. edit mode correctly
- [ ] **Error handling**: Image load failures show fallback, API errors display toast

---

## Quick Reference Links

| Resource | Location |
|---|---|
| Feature spec (user stories, requirements) | [specs/dev/spec.md](spec.md) |
| Implementation plan (architecture, structure) | [specs/dev/plan.md](plan.md) |
| Component research (API details, patterns) | [specs/dev/research.md](research.md) |
| UI implementation plan (detailed Chinese) | [.specify/sdd-docs/plan.md](../../.specify/sdd-docs/plan.md) |
| Data model | [specs/dev/data-model.md](data-model.md) |
| Constitution | [.specify/memory/constitution.md](../../.specify/memory/constitution.md) |
| Existing types | [shared/types/index.d.ts](../../shared/types/index.d.ts) |
| Existing store | [app/stores/galleryStore.ts](../../app/stores/galleryStore.ts) |
| Existing composable | [app/composables/useGallery.ts](../../app/composables/useGallery.ts) |
