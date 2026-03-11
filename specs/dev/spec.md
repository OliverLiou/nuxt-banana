# Feature Specification: Gallery Management

**Feature Branch**: `dev` (current branch)
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Gallery management system with public gallery page and admin management interface"

---

## Clarifications

### Session 2026-03-05

- Q: What interaction pattern should the detail view use (modal/overlay, separate page, or side panel)? → A: Modal / overlay dialog on the gallery page.
- Q: Should the system prevent duplicate badge labels on the same gallery item? → A: Yes, prevent — block adding a badge with a duplicate label on the same item.
- Q: How should the image URL field be handled in the admin form? → A: Images are uploaded to Supabase storage; the system retrieves and stores the resulting public URL automatically. The admin does not manually enter a URL.
- Q: What default sort order should the admin gallery list use? → A: Newest first (by creation date), consistent with the public gallery.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Public Gallery (Priority: P1)

As a **visitor**, I want to browse a gallery of published artwork so that I can discover and view creative pieces without needing to log in.

The gallery presents a visually clean list of active items ordered from newest to oldest. Each item shows a thumbnail, title, and associated category badges. As I scroll down, more items load automatically, allowing me to explore a large collection without pagination interruptions.

**Why this priority**: The public gallery is the primary surface of the product — without it, there is nothing to show end users. All other features either feed into or depend on this view.

**Independent Test**: Open the gallery page as an unauthenticated visitor and verify that only active items appear, sorted newest-first, with infinite scroll loading additional batches.

**Acceptance Scenarios**:

1. **Given** the gallery contains 50 active items, **When** a visitor opens the gallery page, **Then** the first batch of items is displayed sorted by creation date (newest first), each showing a thumbnail, title, and badges.
2. **Given** the visitor has scrolled to the bottom of the currently loaded items, **When** additional active items exist, **Then** the next batch loads automatically without a full page reload.
3. **Given** there are items with `isActive: false` in the system, **When** a visitor views the gallery, **Then** none of those inactive items appear in the list.
4. **Given** the gallery is loading a new batch of items, **When** the visitor is waiting, **Then** a visual loading indicator is displayed.

---

### User Story 2 - View Image Details (Priority: P1)

As a **visitor**, I want to click on a gallery item to view its full details in a modal overlay so that I can see the high-resolution image, read its title, view all badges, see the creation date, and read the full prompt — without leaving the gallery page.

**Why this priority**: Detail view is a core part of the browsing experience and directly tied to the value proposition of sharing AI artwork with prompts.

**Independent Test**: Click any gallery item and confirm the detail view displays the high-resolution image, title, all badges, creation date, and full prompt text.

**Acceptance Scenarios**:

1. **Given** a visitor is browsing the gallery, **When** they click on an item's thumbnail or title, **Then** a modal overlay opens on top of the gallery showing the high-resolution image, title, all associated badges, creation date, and the full prompt.
2. **Given** the detail modal is open, **When** the visitor closes it, **Then** they return to the gallery list at the same scroll position they left.
3. **Given** an item has multiple badges, **When** the detail view is displayed, **Then** all badges are shown with their respective labels and colors.

---

### User Story 3 - Copy Prompt Text (Priority: P2)

As a **visitor**, I want to copy the prompt text from an image's gallery card or detail view so that I can reuse or reference the prompt in my own creative work.

**Why this priority**: Prompt sharing is a key differentiator of this gallery. While not blocking basic browsing, it is essential to the gallery's purpose and user value.

**Independent Test**: Click the copy prompt button on a gallery card's footer and verify the prompt is copied to the clipboard with a success toast. Also open the detail view, click the copy prompt button there, and verify the same behavior. Test with special characters and multi-line prompts.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing an item's detail, **When** they click the "Copy Prompt" button, **Then** the full prompt text is copied to their clipboard.
2. **Given** the prompt was successfully copied, **When** the copy action completes, **Then** a brief visual confirmation (e.g., button text change or icon animation) is shown to the visitor.
3. **Given** a visitor copies a prompt containing special characters or multi-line text, **When** they paste it elsewhere, **Then** the pasted content is identical to the original prompt.
4. **Given** a visitor is browsing the gallery, **When** they click the copy prompt button on a gallery card's footer, **Then** the full prompt text is copied to their clipboard and a success toast is displayed, without opening the detail modal.

---

### User Story 4 - Manage Gallery Items as Admin (Priority: P1)

As an **admin**, I want to view a comprehensive list of all gallery items (both active and inactive) so that I can understand the full inventory and manage items efficiently.

The admin list displays a thumbnail, title, creation date, and current activation status for every item. The current activation status is shown as a read-only indicator on each row. To change an item's active/inactive status, the admin opens the edit form.

**Why this priority**: Admins need visibility into all content and the ability to control what is publicly visible. This is foundational to content management.

**Independent Test**: Log in as an admin, navigate to the gallery management page, and verify all items (active and inactive) are listed with thumbnail, title, date, and a read-only status indicator. Open the edit form and verify that the isActive toggle works from there.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to the gallery management page, **Then** they see a list of all gallery items regardless of active status.
2. **Given** an admin wants to change an item's active status, **When** they open the item's edit form and toggle the isActive switch, **Then** a confirmation prompt appears for deactivation; upon confirming, the item's status is updated and immediately reflected in both the admin list and the public gallery.
3. **Given** an admin activates an item via the edit form, **When** the toggle is set to active and the form is saved, **Then** the item becomes visible on the public gallery without requiring a separate confirmation step.
4. **Given** the admin saves a status change via the edit form, **When** the operation succeeds, **Then** a success notification is displayed on screen.
5. **Given** the admin saves a status change via the edit form, **When** the operation fails, **Then** a failure notification is displayed and the item's status reverts to its previous state.

---

### User Story 5 - Create and Edit Gallery Items (Priority: P1)

As an **admin**, I want to create new gallery items and edit existing ones using a structured form so that I can publish and maintain artwork entries with accurate metadata.

The form requires an uploaded image, a title, and a prompt as mandatory fields. The admin uploads an image file which is stored in Supabase storage, and the system automatically retrieves and saves the resulting public URL. I can add category badges by typing a label and selecting a color from a predefined set. I can also set the item's active/inactive status before saving.

**Why this priority**: Without the ability to create and edit items, the gallery would have no content. This is a critical path feature.

**Independent Test**: Log in as an admin, create a new item filling all required fields plus badges and status, save it, then edit the same item to change its title and badges. Verify changes persist and the item appears on the public gallery if set to active.

**Acceptance Scenarios**:

1. **Given** an admin opens the "Create Item" form, **When** they upload an image, fill in the title and prompt, add badges, set the status, and submit, **Then** the image is stored, the item is saved with the resulting public URL, and a success notification is displayed.
2. **Given** an admin leaves a required field (image, title, or prompt) empty, **When** they attempt to submit, **Then** the form is blocked from submitting and a validation message highlights which fields need attention.
3. **Given** an admin is adding a badge, **When** they enter a label, **Then** they must select a color from the system's predefined color options before the badge can be attached.
4. **Given** an admin opens the edit form for an existing item, **When** the form loads, **Then** all current field values (current image preview, title, prompt, badges, status) are pre-populated. The admin may upload a new image to replace the existing one.
5. **Given** an admin successfully saves a new or edited item, **When** the save completes, **Then** the admin list view refreshes to reflect the changes.

---

### User Story 6 - Delete Gallery Items (Priority: P2)

As an **admin**, I want to delete gallery items that are no longer needed so that I can keep the content inventory clean and relevant.

**Why this priority**: Deletion is important for long-term maintenance but is less frequently used than creation, editing, and status toggling.

**Independent Test**: Log in as an admin, attempt to delete a gallery item, confirm the deletion in the confirmation dialog, and verify the item is removed from both the admin list and the public gallery.

**Acceptance Scenarios**:

1. **Given** an admin selects "Delete" on a gallery item, **When** the action is triggered, **Then** a confirmation dialog appears asking the admin to confirm the irreversible action.
2. **Given** the confirmation dialog is displayed, **When** the admin confirms deletion, **Then** the item is permanently removed and a success notification is shown.
3. **Given** the confirmation dialog is displayed, **When** the admin cancels, **Then** no changes are made and the dialog closes.
4. **Given** deletion fails due to a system error, **When** the operation completes, **Then** a failure notification is displayed and the item remains intact.

---

### Edge Cases

- **Empty gallery**: When no active items exist, the public gallery must display a clear empty-state message (e.g., "目前尚無公開的展示作品") instead of a blank page.
- **Broken image URL**: If an item's `image_url` is empty or cannot be loaded, a text fallback (`'尚未設定圖片'`) must be rendered in place of the image. The fallback mechanism differs by view: the public gallery (`UBlogPost`) and detail modal use `@error` event handlers on the image element; the admin table uses conditional rendering in the `h()` render function. No placeholder image file is used.
- **Extremely long prompt text**: Prompts may contain hundreds or thousands of characters. The detail view and copy function must handle arbitrarily long text without truncation or UI overflow issues.
- **Special characters in prompts**: Prompts may contain Unicode, angle brackets, quotation marks, newlines, and other special characters. These must be displayed and copied faithfully.
- **Rapid status toggling**: If an admin rapidly toggles an item's status multiple times, the system must handle each request sequentially and reflect the final correct state — no race conditions or stale UI.
- **Duplicate badge labels**: An admin may attempt to add the same badge label twice to a single item. The system shall prevent duplicate labels on the same item by blocking the addition and informing the admin.
- **Concurrent admin edits**: If two admins edit the same item simultaneously, the last save wins, but no data corruption should occur.
- **Large image files**: The gallery must handle display of items linked to very large image files without blocking the page render (e.g., lazy loading of images).
- **Image upload failure**: If the image upload to storage fails (network error, file too large, unsupported format), the system must display a clear error message to the admin and prevent form submission until a valid image is provided.
- **Admin deletes an item currently being viewed**: If a visitor has an item's detail view open while an admin deletes it, subsequent interactions (e.g., copy prompt) should fail gracefully.
- **Badge color consistency**: Badge colors must always come from the predefined system palette. Free-form color input is not allowed.
- **Form navigation with unsaved changes**: If an admin navigates away from a form with unsaved changes, the system must display a confirmation dialog warning about unsaved changes before allowing navigation away.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public gallery page shall display only gallery items where `isActive` is `true`.
- **FR-002**: Gallery items on the public page shall be sorted by creation date (`created_at`) in descending order (newest first).
- **FR-003**: The public gallery shall implement scroll-based loading (infinite scroll) to progressively load items as the user scrolls down.
- **FR-004**: Each item in the public gallery list shall display a thumbnail image, the item title, and all associated badges (with label and color).
- **FR-005**: Clicking a gallery item shall open a modal overlay displaying: the high-resolution image (`image_url`), title, all badges with labels and colors, creation date, and the full prompt text. Closing the modal returns the visitor to the gallery at their previous scroll position.
- **FR-006**: The detail view and the gallery card footer shall each include a "Copy Prompt" action that copies the full prompt text to the user's clipboard and provides immediate visual feedback upon success.
- **FR-007**: When no active gallery items exist, the public gallery shall display an empty-state message clearly informing the visitor that no works are currently available.
- **FR-008**: When an item's `image_url` is empty or fails to load, the system shall display the fallback text `'尚未設定圖片'` using a strategy appropriate to each view: (a) in the public gallery (`UBlogPost`), an `@error` event handler on the image element triggers the fallback display; (b) in the detail modal (`GalleryDetail`), an `@error` handler on the `<img>` element triggers the fallback display; (c) in the admin table (`UTable`), conditional rendering (`v-if`/ternary in `h()`) displays the text directly when `image_url` is empty. No placeholder image file is used.
- **FR-009**: The admin gallery management page shall display all gallery items (both active and inactive), sorted by creation date in descending order (newest first), showing each item's thumbnail, title, creation date, and current active status.
- **FR-010**: The admin list shall display a read-only status indicator (`USwitch` with `disabled: true`) showing each item's current `isActive` state. Toggling `isActive` is performed exclusively through the edit form, not from the admin list.
- **FR-011**: Sensitive admin operations (deletion, deactivation) shall require a confirmation dialog before execution to prevent accidental changes.
- **FR-012**: The admin item form shall provide an image upload control. Upon upload, the image is stored in Supabase storage and the resulting public URL is saved as the item's `image_url`. Title (`title`) and prompt (`prompt`) remain required text fields. At least one badge must be attached before submission. The form shall block submission and display field-level error messages when any required field is missing or when no badges are attached.
- **FR-013**: The admin item form shall allow adding badges, where each badge consists of a free-text label and a color selected from a predefined system palette.
- **FR-014**: The admin item form shall include an option to set the item's `isActive` status.
- **FR-015**: All admin create, update, and delete operations shall display a success or failure notification to the admin upon completion.
- **FR-016**: The admin shall be able to permanently delete a gallery item, with the item being removed from both the admin list and the public gallery upon successful deletion.
- **FR-017**: When an admin navigates away from the item form with unsaved changes, the system shall display a confirmation dialog warning about potential data loss before allowing navigation.
- **FR-018**: Each gallery item shall allow a maximum of 10 badges to be attached. The form shall prevent adding more badges once the limit is reached.
- **FR-019**: The admin item form shall prevent adding a badge with a label that already exists on the same gallery item, displaying a message indicating the duplicate.
- **FR-020**: The admin gallery page shall be protected by a route middleware that verifies the user's role. The middleware reads the cached role from the user store; if the user is not authenticated (`role` is null/undefined), the system redirects to `/login`; if the user is authenticated but not an admin, the system redirects to `/` and displays a toast notification `'您無此頁面權限, 即將為您導回首頁'`.

### Key Entities

- **GalleryItem**: Represents a single artwork entry in the gallery. Core attributes:
  - `id` — Unique identifier for the item.
  - `title` *(required)* — Display title of the artwork.
  - `image_url` *(required)* — URL to the full-resolution image asset.
  - `prompt` *(required)* — The generative prompt text associated with the artwork.
  - `badges` — A collection of categorization tags attached to the item (see Badge entity).
  - `isActive` — Boolean flag controlling whether the item is visible on the public gallery. Defaults to `true` on creation.
  - `created_at` — Timestamp recording when the item was created; used for default sort ordering.

- **Badge**: Represents a categorization tag attached to a GalleryItem. Core attributes:
  - `label` — Free-text descriptor for the badge (e.g., "Landscape", "Portrait", "Anime").
  - `color` — Visual color of the badge, restricted to the predefined color options provided by the project's existing UI component library (matching the badge/tag color variants available in @nuxt/ui).

---

## Assumptions

1. **Authentication is pre-existing; admin guard is new**: Supabase authentication (@nuxtjs/supabase) is already configured and provides user login. Role-based access control requires new infrastructure:
   - **Database tables (pre-existing in Supabase)**: `profiles` table (`id: uuid PK`, `userId: uuid FK→auth.users.id`, `roleId: text FK→roles.id`) and `roles` table (`id: text PK` e.g. `'admin'`, `'user'`; `created_at: timestamptz`).
   - **User store (new)**: A Pinia setup store (`app/stores/userStore.ts`) caches the authenticated user's `roleId` after login. The login page fetches the user's profile from `profiles` using `userId` and stores the `roleId`.
   - **Route middleware (new)**: An `auth` middleware (`app/middleware/auth.ts`) reads `roleId` from `userStore`. If `roleId` is `null`/`undefined`, redirect to `/login`. If `roleId` is not `'admin'`, redirect to `/` with toast `'您無此頁面權限, 即將為您導回首頁'`.
   - **Page guard**: Admin gallery page uses `definePageMeta({ middleware: 'auth' })` to activate the middleware.
2. **Image hosting via Supabase storage**: Images are uploaded by admins through the form. The system stores them in Supabase storage and persists the resulting public URL in the gallery item record. Admins do not manually enter image URLs.
3. **Single language**: The gallery interface and admin panel are presented in a single language (Traditional Chinese based on the PRD) and do not require localization support at this time.
4. **Badge colors are system-defined**: The palette of available badge colors is defined and maintained by the system. Admins cannot create custom colors outside this palette.
5. **No search or filtering on public gallery**: The initial release of the public gallery does not include search, filtering by badge, or category-based navigation. Items are shown in a single chronological stream.
6. **No soft-delete**: Deleting a gallery item is a permanent, irreversible operation. There is no recycle bin or undo.
7. **Admin is a single role**: There is no distinction between admin permission levels (e.g., editor vs. super-admin). Any authenticated admin can perform all management operations.
8. **Scroll-loading batch size is system-determined**: The number of items loaded per scroll batch is determined internally and is not user-configurable.

9. **Badge limit per item**: Each gallery item may have a maximum of 10 badges attached. This provides ample categorization flexibility while preventing UI clutter.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can browse the public gallery and see only active items, sorted newest-first, without encountering any inactive items — verified by cross-referencing the displayed items against the data source.
- **SC-002**: Scroll-based loading functions correctly: when a visitor scrolls to the bottom of the current batch, the next batch of items loads within 2 seconds under normal network conditions.
- **SC-003**: Clicking any gallery item opens a detail view that displays all required information (high-resolution image, title, badges, creation date, prompt) — with zero fields missing or blank for a fully populated item.
- **SC-004**: The "Copy Prompt" action copies the exact prompt text to the clipboard (verified by paste comparison), and a visual confirmation is displayed within 1 second of clicking.
- **SC-005**: When the gallery has zero active items, the empty-state message is displayed instead of a blank or broken page.
- **SC-006**: When a gallery item's image URL is empty or unreachable, the text `'尚未設定圖片'` is displayed in both the list and detail views — no broken image icons appear.
- **SC-007**: An admin can view the complete inventory of gallery items (active and inactive) on the management page, with each item displaying thumbnail, title, creation date, and status.
- **SC-008**: An admin can toggle an item's active status via the edit form, with a confirmation step for deactivation, and the change is reflected on both the admin list and the public gallery within 5 seconds.
- **SC-009**: An admin can successfully create a new gallery item by filling all required fields, adding badges, and setting status — the item appears in the admin list and (if active) on the public gallery immediately after saving.
- **SC-010**: Submitting the admin form with any required field left empty is blocked, and the user receives clear, field-specific validation messages indicating what needs to be corrected.
- **SC-011**: Deleting a gallery item requires confirmation, and upon confirmation the item is permanently removed from both the admin list and the public gallery.
- **SC-012**: All admin operations (create, update, delete, status toggle) produce a visible success or failure notification upon completion — no silent failures.
