# Quickstart: Public Gallery and Admin Management

## Prerequisites

- Project dependencies are installed with `npm install`.
- Supabase environment variables and project configuration are available locally.
- `app/types/database.types.ts` exists so the configured Supabase types path resolves.

## Start the App

```bash
npx nuxi prepare
npm run dev
```

Open the local application in a browser after the dev server starts.

## Validate the Public Gallery

1. Visit `/`.
2. Confirm the hero introduces the gallery and shows featured content derived from gallery items
   with `isActive = true`.
3. Confirm the gallery shows only items with `isActive = true` in newest-first order.
4. Open a gallery item detail modal and verify the full image, title, prompt, badges, and date.
5. Use the copy prompt action and confirm immediate success feedback appears.
6. Validate loading, empty, fetch-failure, and broken-image states.

## Validate Authentication and Admin Access

1. Visit `/admin` while signed out and confirm the app redirects to `/`.
2. Visit `/login` and trigger Google sign-in.
3. Complete the auth callback and confirm `/confirm` resolves the session and returns an
   authorized admin to `/admin`.
4. Confirm a signed-in non-admin user is still redirected away from admin content.

## Validate Admin CRUD

1. Confirm the admin table lists all gallery items in newest-first order.
2. Open the create slideover and submit a valid `.webp` image under 2 MB with title, prompt,
   optional badges, and `isActive` status.
3. Confirm the list refreshes and success feedback appears.
4. Edit an existing item without replacing its image and confirm the update succeeds.
5. Replace an existing image and confirm the submit path uploads the file, resolves a public
   URL, and then saves the database record.
6. Simulate a public-URL failure and confirm the save is blocked, no DB change occurs, and an
   error toast appears.
7. Trigger delete, confirm the modal shows the target item, cancel once, then confirm the delete
   and verify the table refreshes.

## Final Verification

```bash
npm run build
```

The feature is ready for task generation once the manual scenarios above pass and the production
build succeeds.
