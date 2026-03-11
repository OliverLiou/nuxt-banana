# Research: Gallery Management

> Phase 0 research for the Gallery Management feature.
> Project: nuxt-banana (Nuxt 4.3+, @nuxt/ui v4.4+, Supabase, Pinia, TailwindCSS 4)

---

## R-001: @nuxt/ui UScrollArea — Responsive Scroll Container

- **Decision**: Use `UScrollArea` with the `orientation` prop toggled reactively based on viewport breakpoint. Set `orientation="vertical"` on `md+` screens and `orientation="horizontal"` on mobile.
- **Rationale**: The plan requires a responsive scroll container that switches direction by breakpoint. `UScrollArea` wraps Reka UI ScrollArea and natively supports `orientation` as `'vertical' | 'horizontal'`.
- **Alternatives considered**: Plain CSS `overflow-x-auto` / `overflow-y-auto` containers — rejected because they lack the built-in virtualization support and themed scrollbar styling that `UScrollArea` provides.
- **Key API details**:
  - **Props**: `orientation` (`'vertical' | 'horizontal'`, default `'vertical'`), `items` (array), `virtualize` (boolean or options object with `estimateSize`, `lanes`, `gap`, `overscan`), `as` (element type), `ui` (style slots: `root`, `viewport`, `item`).
  - **Slots**: `#default` — receives `{ item, index, virtualItem? }` when `items` is provided.
  - **Events**: `@scroll` — emits `[isScrolling: boolean]`.
  - **Exposed**: `$el` (root HTMLElement), `virtualizer` (TanStack Virtual instance when virtualized).
  - **Responsive orientation pattern**:
    ```vue
    <script setup>
    const breakpoints = useBreakpoints({ md: 768 })
    const mdAndUp = breakpoints.greaterOrEqual('md')
    const orientation = computed(() => mdAndUp.value ? 'vertical' : 'horizontal')
    </script>

    <UScrollArea :orientation="orientation" class="h-[calc(100vh-4rem)]">
      <!-- gallery items -->
    </UScrollArea>
    ```
  - **Infinite scroll integration**: Use `useInfiniteScroll` from VueUse targeting the ScrollArea's inner viewport element. See R-013 for full pattern.

---

## R-002: @nuxt/ui UBlogPost — Gallery Item Card

- **Decision**: Use `UBlogPost` to render each gallery item in the public gallery. Only use `title` and `image` props — do not use `description`, `date`, `variant`, `orientation`, or other unspecified props (其餘未指定的屬性請勿使用). Use `#badge` slot for rendering multiple badges and `#footer` slot for icon-only action buttons.
- **Rationale**: `UBlogPost` provides a structured card with image, title, badge, and footer slots. Keeping prop usage minimal ensures forward compatibility and matches the confirmed plan.
- **Alternatives considered**: Custom card component with `UCard` — rejected because `UBlogPost` already provides image handling and proper slot architecture for badges and footer out of the box.
- **Key API details**:
  - **Props (used)**: `title` (string), `image` (string — bound to `image_url`). Do not use `description`, `date`, `variant`, `orientation`, or other unspecified props.
  - **Slots**: `#badge` — custom badge rendering area; `#footer` — icon-only action buttons; `#title`, `#default`.
  - **Theme slots**: `root`, `header`, `body`, `footer`, `image`, `title`, `description`, `authors`, `avatar`, `meta`, `date`, `badge`.
  - **Gallery item mapping**:
    ```vue
    <UBlogPost
      :title="item.title"
      :image="item.image_url"
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
          variant="outline"
          color="neutral"
          size="sm"
          @click="copyPrompt(item.prompt)"
        />
        <UButton
          icon="i-lucide-eye"
          variant="outline"
          color="neutral"
          size="sm"
          @click="openDetail(item)"
        />
      </template>
    </UBlogPost>
    ```
  - **Image error handling**: When `image_url` is empty or fails to load, render fallback text `'尚未設定圖片'` instead of displaying a broken image. Use conditional rendering (`v-if`/`v-else` or ternary in `h()`) to show a styled text placeholder. Example: `<span v-if="!item.image_url" class="text-sm text-muted">尚未設定圖片</span>`

---

## R-003: @nuxt/ui UTable — Admin Gallery List

- **Decision**: Use `UTable` with TanStack Table `ColumnDef` array for full control over column rendering. Custom cells use Vue's `h()` render function to embed `USwitch`, `UBadge`, `UButton`, and image thumbnails.
- **Rationale**: `UTable` is built on TanStack Table and requires `h()` or `resolveComponent` for custom cell rendering. This provides type-safe, flexible column definitions.
- **Alternatives considered**: Using slot-based rendering (`#cell-*` slots) — considered but the skill docs and official examples strongly recommend the `columns` array with `h()` for structured table rendering.
- **Key API details**:
  - **Props**: `data` (array of objects), `columns` (array of ColumnDef), `meta` (TableMeta), `loading` (boolean), `sticky` (boolean), `virtualize` (boolean or options).
  - **Slots**: `#default`, `#header-*`, `#cell-*`, `#expanded`, `#empty`.
  - **Events**: `@select` (row click), `@contextmenu`, `@hover`.
  - **Column definition pattern for gallery admin**:
    ```ts
    import { h, resolveComponent } from 'vue'
    import type { ColumnDef } from '@tanstack/vue-table'

    const columns: ColumnDef<GalleryItem>[] = [
      {
        accessorKey: 'image_url',
        header: '圖片',
        cell: ({ row }) => row.original.image_url
          ? h('img', {
              src: row.original.image_url,
              class: 'w-16 h-16 object-cover rounded',
            })
          : h('span', { class: 'text-sm text-(--ui-text-muted)' }, '尚未設定圖片')
      },
      {
        accessorKey: 'title',
        header: '標題'
      },
      {
        accessorKey: 'prompt',
        header: '提示詞',
        cell: ({ row }) => h('span', { class: 'truncate max-w-48 block' }, row.original.prompt)
      },
      {
        accessorKey: 'created_at',
        header: '建立日期',
        cell: ({ row }) => formatDate(row.original.created_at)
      },
      {
        accessorKey: 'isActive',
        header: '啟用',
        cell: ({ row }) => h(resolveComponent('USwitch'), {
          modelValue: row.original.isActive,
          disabled: true
        })
      },
      {
        accessorKey: 'badges',
        header: '標籤',
        cell: ({ row }) => h('div', { class: 'flex flex-wrap gap-1' },
          row.original.badges.map(b =>
            h(resolveComponent('UBadge'), { label: b.label, color: b.color, variant: 'outline' })
          )
        )
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
          h(resolveComponent('UButton'), {
            icon: 'lucide:edit',
            color: 'neutral',
            variant: 'outline',
            size: 'xs',
            onClick: () => openEdit(row.original)
          }),
          h(resolveComponent('UButton'), {
            icon: 'lucide:trash',
            color: 'error',
            variant: 'outline',
            size: 'xs',
            onClick: () => confirmDelete(row.original)
          })
        ])
      }
    ]
    ```

---

## R-004: @nuxt/ui UForm + Custom Validation Function

- **Decision**: Use `UForm` with the `validate` prop (custom validation function) instead of schema-based validation. The validate function returns `FormError[]` and distinguishes between create mode (requires `upload_image`) and edit mode (requires `image_url`).
- **Rationale**: The plan explicitly specifies custom validation (non-schema-based) to handle the conditional required-field logic between create and edit modes. The `validate` prop is the official mechanism for this.
- **Alternatives considered**: Zod/Valibot schema with `discriminatedUnion` — rejected because it adds unnecessary complexity for conditional field requirements that differ only by mode. Custom validation is cleaner and directly recommended in the Nuxt UI docs.
- **Key API details**:
  - **Props**: `state` (reactive object), `validate` (function returning `FormError[]`), `schema` (optional Standard Schema), `validate-on` (array of `'input' | 'change' | 'blur'`), `loading-auto` (boolean, default `true` — disables inputs during submit), `disabled`, `nested`.
  - **Emits**: `@submit` (receives `FormSubmitEvent<Schema>` with `event.data`), `@error` (receives `FormErrorEvent`).
  - **Exposed**: `submit()`, `validate()`, `clear()`, `getErrors()`, `setErrors()`, `errors`, `dirty`, `dirtyFields`.
  - **Type**: `FormError` = `{ name: string; message: string }`.
  - **Custom validation pattern**:
    ```ts
    import type { FormError } from '@nuxt/ui'

    const isEditMode = computed(() => !!formState.id)

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
  - **Template usage**:
    ```vue
    <UForm :validate="validate" :state="formState" @submit="onSubmit">
      <UFormField name="title" label="標題" required>
        <UInput v-model="formState.title" />
      </UFormField>
      <!-- ... -->
    </UForm>
    ```

---

## R-005: @nuxt/ui USlideover — Side Panel for Create/Edit

- **Decision**: Use `USlideover` with `v-model:open` for the create/edit form panel. Slide in from the right side, with `#header`, `#body`, and `#footer` slots for structured layout. The same `USlideover` instance serves both create and edit by resetting/populating form state.
- **Rationale**: The plan requires a side panel for forms. `USlideover` is the official Nuxt UI component for this pattern, built on Reka UI Dialog.
- **Alternatives considered**: `UModal` — rejected because the plan explicitly specifies a slide-over panel, not a centered dialog. `UDrawer` — rejected because drawers are bottom sheets better suited for mobile.
- **Key API details**:
  - **Props**: `open` (v-model:open), `title` (string), `description` (string), `close` (boolean or object, set `false` to hide), `side` (`'left' | 'right' | 'top' | 'bottom'`), `overlay` (boolean), `transition` (boolean), `modal` (boolean), `dismissible` (boolean).
  - **Slots**: `#content` (replaces all default structure), `#header`, `#body`, `#footer`.
  - **Pattern**:
    ```vue
    <USlideover v-model:open="isSlideoverOpen" :title="isEditMode ? '編輯項目' : '新增項目'" side="right">
      <template #body>
        <UForm :validate="validate" :state="formState" @submit="onSubmit">
          <!-- form fields -->
        </UForm>
      </template>
      <template #footer>
        <UButton variant="ghost" @click="isSlideoverOpen = false">取消</UButton>
        <UButton type="submit" :loading="submitting" @click="formRef?.submit()">儲存</UButton>
      </template>
    </USlideover>
    ```
  - **Note**: When submit button is outside `<UForm>`, use `formRef?.submit()` to trigger HTML5 validation and form submission programmatically.

---

## R-006: @nuxt/ui UFileUpload — Admin Image Upload

- **Decision**: Use `UFileUpload` with the `useFileUpload` composable for image upload in the admin form. Bind via `v-model` to track selected files. On form submit, upload to Supabase Storage before saving the record.
- **Rationale**: `UFileUpload` provides drag-and-drop zone, file type restriction, and preview capabilities. The `useFileUpload` composable provides `files`, `open`, `reset`, and `remove` helpers.
- **Alternatives considered**: Raw `<input type="file">` — rejected because UFileUpload provides consistent theming, drag-and-drop, and file list management out of the box.
- **Key API details**:
  - **Props**: `accept` (string, e.g. `'.webp'`), `multiple` (boolean), `dropzone` (boolean), `interactive` (boolean), `label` (string), `description` (string), `icon` (string), `color`, `variant` (`'area' | 'button'`), `size`.
  - **Slots**: `#default` (receives `{ dragover }`), `#actions`.
  - **Composable**: `useFileUpload({ accept, multiple, maxFiles, maxSize })` returns `{ files, open, reset, remove }`. For this feature: `accept: '.webp'`, `maxSize: 2 * 1024 * 1024`.
  - **v4.4 note**: FileUpload now emits `null` when clearing files (previously emitted empty array).
  - **Pattern for gallery admin**:
    ```vue
    <script setup>
    const { files: uploadFiles, open, reset } = useFileUpload({
      accept: '.webp',
      maxFiles: 1,
      maxSize: 2 * 1024 * 1024
    })
    </script>

    <template>
      <UFormField name="upload_image" label="圖片">
        <template v-if="formState.image_url">
          <img :src="formState.image_url" class="w-full max-h-48 object-cover rounded" />
          <UButton variant="ghost" size="xs" @click="formState.image_url = ''">重新上傳</UButton>
        </template>
        <UFileUpload
          v-else
          v-model="uploadFiles"
          accept=".webp"
          label="拖放圖片或點擊上傳"
          description="WebP 格式 (最大 2MB)"
          icon="i-lucide-upload"
        />
      </UFormField>
    </template>
    ```

---

## R-007: @nuxt/ui USwitch — Inline isActive Toggle

- **Decision**: Use `USwitch` in two contexts: (1) In the admin UTable cell with `disabled: true` (display only — no inline toggling); (2) In the edit form with interactive `v-model` binding (toggle is done through the edit form only).
- **Rationale**: `USwitch` is the official toggle component based on Reka UI Switch. The plan confirms the table switch is display-only (`disabled: true`), and toggling is handled exclusively through the edit form.
- **Alternatives considered**: `UCheckbox` — rejected because a toggle switch is the standard UX pattern for boolean status fields.
- **Key API details**:
  - **Props**: `modelValue` (boolean, via v-model), `label` (string), `description` (string), `loading` (boolean — shows spinner), `color` (semantic color), `size` (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`), `disabled` (boolean), `on-icon`, `off-icon`.
  - **Events**: `@update:modelValue` (emitted when toggled — only used in form context).
  - **Note**: USwitch in admin table is `disabled: true` — display only. Toggle is done through the edit form's USwitch (which is interactive).
  - **Inline table display pattern (disabled)**:
    ```ts
    // In column definition cell function — display only, no toggle handler
    cell: ({ row }) => h(resolveComponent('USwitch'), {
      modelValue: row.original.isActive,
      disabled: true
    })
    ```
  - **Form context (interactive)**:
    ```vue
    <UFormField name="isActive" label="啟用">
      <USwitch v-model="formState.isActive" />
    </UFormField>
    ```

---

## R-008: @nuxt/ui UBadge — Badge Rendering

- **Decision**: Use `UBadge` with `variant="outline"` and dynamic `color` binding from the `badge.color` field. The `color` type is `BadgeProps['color']` from `#ui/types`, already defined in the GalleryItem type.
- **Rationale**: The plan specifies `variant="outline"` for badge rendering. Badge colors come from the predefined Nuxt UI semantic palette.
- **Alternatives considered**: Custom badge component — unnecessary since `UBadge` directly supports all required props.
- **Key API details**:
  - **Props**: `label` (string), `color` (semantic color — `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'`), `variant` (`'solid' | 'outline' | 'soft' | 'subtle'`), `size` (`'xs' | 'sm' | 'md' | 'lg'`), `icon` (string), `avatar` (AvatarProps), `class`.
  - **Color type integration**: The project uses `BadgeProps['color']` from `#ui/types` for the Badge color type in the `GalleryItem` interface, ensuring type safety with Nuxt UI's palette.
  - **Pattern**:
    ```vue
    <UBadge
      v-for="badge in item.badges"
      :key="badge.label"
      :label="badge.label"
      :color="badge.color"
      variant="outline"
    />
    ```

---

## R-009: @nuxt/ui UButton — Action Buttons

- **Decision**: Use `UButton` with appropriate `variant` and `color` props for each action context. Gallery card buttons are icon-only with `variant="outline"` and `color="neutral"`. Admin table action buttons are icon-only with `variant="outline"`.
- **Rationale**: `UButton` is the standard interactive element in Nuxt UI, supporting icons, loading states, and variant-based styling. Icon-only buttons (no label) are used for compact UI in cards and table rows.
- **Alternatives considered**: None — `UButton` is the only appropriate choice.
- **Key API details**:
  - **Props**: `label` (string), `color` (semantic color), `variant` (`'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'`), `size` (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`), `icon` (string — leading icon), `trailing-icon`, `avatar`, `loading` (boolean — shows spinner and disables), `disabled` (boolean), `block` (full-width), `class`, `ui`.
  - **Link props**: Also accepts `to`, `target`, `href` etc. for navigation.
  - **Button variants in this feature**:
    - **Copy prompt (card #footer)**: `variant="outline"`, `color="neutral"`, `icon="i-lucide-copy"`, `size="sm"` (icon only, no label)
    - **Detail view (card #footer)**: `variant="outline"`, `color="neutral"`, `icon="i-lucide-eye"`, `size="sm"` (icon only, opens modal)
    - **Add new**: `icon="i-lucide-plus"`, default variant
    - **Edit row (admin table)**: `color="neutral"`, `variant="outline"`, `icon="lucide:edit"`, `size="xs"` (icon only, no label)
    - **Delete row (admin table)**: `color="error"`, `variant="outline"`, `icon="lucide:trash"`, `size="xs"` (icon only, no label)
    - **Form submit**: default color, `:loading="submitting"`
    - **Add badge**: `variant="outline"`, `size="sm"`

---

## R-010: useToast() — Toast Notifications

- **Decision**: Use the `useToast()` composable for all success/error notifications. Requires `<UApp>` wrapper in app root (already present in the project).
- **Rationale**: `useToast()` is the official Nuxt UI notification system. The plan requires toast notifications for copy success, CRUD success/failure, and status toggle results.
- **Alternatives considered**: None — `useToast()` is the standard and only recommended approach.
- **Key API details**:
  - **Usage**: `const toast = useToast()`
  - **Methods**: `toast.add(options)`, `toast.remove(id)`, `toast.clear()`.
  - **Options**: `id` (string — auto-generated if omitted), `title` (string), `description` (string), `color` (`'primary' | 'success' | 'error' | 'warning' | 'info'`), `icon` (string), `avatar` (object), `timeout` (number, default 5000, 0 = persistent), `actions` (array of `{ label, click }`), `callback` (on dismiss).
  - **Common patterns for this feature**:
    ```ts
    const toast = useToast()

    // Copy success
    toast.add({ title: '複製成功', color: 'success', icon: 'i-lucide-check' })

    // CRUD success
    toast.add({ title: '項目已新增', color: 'success', icon: 'i-lucide-check-circle' })

    // Error
    toast.add({ title: '操作失敗', description: error.message, color: 'error', icon: 'i-lucide-x-circle' })

    // Status toggle
    toast.add({ title: '狀態已更新', color: 'success' })
    ```

---

## R-011: Supabase Storage API — Image Upload Pattern

- **Decision**: Use `useSupabaseClient()` to access the Supabase Storage API. Upload `.webp` images only (max 2MB) to a dedicated bucket (e.g., `images`), generate a unique filename with timestamp, then retrieve the public URL via `getPublicUrl()`.
- **Rationale**: The project already uses `@nuxtjs/supabase` module (v2.0.3) which provides `useSupabaseClient()`. The plan requires uploading to Supabase Storage and obtaining the public URL before saving the gallery item record. Only `.webp` format is accepted (max 2MB).
- **Alternatives considered**: Server-side API route for upload — rejected for SPA mode (`ssr: false`). Direct Supabase client upload is simpler and works well for client-side SPAs.
- **Key API details**:
  - **File restrictions**: `.webp` format only, maximum 2MB. Validated client-side via `useFileUpload({ accept: '.webp', maxSize: 2 * 1024 * 1024 })`.
  - **Upload pattern**:
    ```ts
    const supabase = useSupabaseClient()

    async function uploadImage(file: File): Promise<string | null> {
      const fileName = `nbp-${Date.now()}.webp`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: 'image/webp',
          upsert: false
        })

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
  - **Integration with form submit**: The upload must succeed before the gallery item record is saved. If upload fails, form submission is aborted.
  - **Existing pattern in codebase**: The composable `useGallery.ts` already uses `useSupabaseClient()` and `useAsyncData()` with `server: false` (SPA mode). Image URLs in mock data follow the pattern `https://<project>.supabase.co/storage/v1/object/public/images/<filename>.webp`.

---

## R-012: Supabase Client CRUD — Data Operations

- **Decision**: Use `useSupabaseClient()` for all CRUD operations on the `gallery_items` table. Follow the existing pattern of `.from().select()/insert()/update()/delete()` with proper error handling and toast notifications. The `id` column is UUID (string), not BIGINT.
- **Rationale**: The project already has an established pattern with `@nuxtjs/supabase` (see `useGallery.ts`). All operations are client-side since `ssr: false`. `GalleryItem.id` is UUID type (string) in Supabase.
- **Alternatives considered**: Server API routes with Nitro — rejected because the project is an SPA (`ssr: false`) and direct Supabase client calls are the established pattern.
- **Key API details**:
  - **Select (public gallery — active only, sorted)**:
    ```ts
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('isActive', true)
      .order('created_at', { ascending: false })
      .range(from, to) // for pagination
    ```
  - **Select (admin — all items, sorted)**:
    ```ts
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
    ```
  - **Insert**:
    ```ts
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        title: formState.title,
        image_url: publicUrl,
        prompt: formState.prompt,
        badges: formState.badges,
        isActive: formState.isActive
      })
      .select()
      .single()
    ```
  - **Update**:
    ```ts
    const { data, error } = await supabase
      .from('gallery_items')
      .update({
        title: formState.title,
        image_url: formState.image_url,
        prompt: formState.prompt,
        badges: formState.badges,
        isActive: formState.isActive
      })
      .eq('id', formState.id) // id is UUID string
      .select()
      .single()
    ```
  - **Delete** (id is UUID string):
    ```ts
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', itemId) // itemId: string (UUID)
    ```
  - **Note on `id` type**: `GalleryItem.id` is UUID (string) in Supabase, not BIGINT (number). All `.eq('id', ...)` calls receive a string value. The `badges` JSONB column is nullable at the DB level, but the UI form enforces ≥1 badge.
  - **Existing codebase pattern**: Store uses `setItems()`, `setPending()`, `setError()` setters. Composable wraps Supabase calls in `useAsyncData()` with `server: false`.

---

## R-013: Infinite Scroll / Pagination — Scroll-Based Loading

- **Decision**: Use VueUse's `useInfiniteScroll` composable targeting the `UScrollArea` viewport element, combined with Supabase's `.range(from, to)` for offset-based pagination.
- **Rationale**: The official Nuxt UI ScrollArea documentation explicitly demonstrates an infinite scroll example using `useInfiniteScroll` from VueUse. Supabase's `.range()` method provides efficient offset-based pagination. The plan requires scroll-based loading for the public gallery.
- **Alternatives considered**: 
  - Cursor-based pagination with `created_at` — considered for better performance on very large datasets, but `.range()` is simpler and sufficient for gallery-sized data.
  - Intersection Observer API directly — rejected because `useInfiniteScroll` already wraps this with a clean API.
- **Key API details**:
  - **Pattern (from Nuxt UI ScrollArea docs)**:
    ```ts
    const PAGE_SIZE = 12
    const page = ref(0)
    const items = ref<GalleryItem[]>([])
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

      if (error) {
        toast.add({ title: '載入失敗', color: 'error' })
      } else {
        items.value.push(...(data ?? []))
        hasMore.value = (data?.length ?? 0) === PAGE_SIZE
        page.value++
      }
      loading.value = false
    }

    // Initial load
    await loadMore()

    // Infinite scroll via VueUse
    useInfiniteScroll(
      () => scrollAreaRef.value?.$el?.querySelector('[data-reka-scroll-area-viewport]'),
      () => loadMore(),
      { distance: 200 }
    )
    ```
  - **Template**:
    ```vue
    <UScrollArea ref="scrollArea" class="h-[calc(100vh-4rem)]">
      <div class="grid gap-4 p-4">
        <UBlogPost v-for="item in items" :key="item.id" ... />
      </div>
      <div v-if="loading" class="flex justify-center p-4">
        <UButton loading variant="ghost" />
      </div>
    </UScrollArea>
    ```
  - **Important**: The `useInfiniteScroll` target must be the ScrollArea's viewport element, not the root. Access via `scrollAreaRef.value?.$el?.querySelector('[data-reka-scroll-area-viewport]')` or the exposed `$el`.
