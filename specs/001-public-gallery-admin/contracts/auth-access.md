# Contract: Authentication and Admin Access

## Purpose

Define the route, state, and authorization behavior that protects the admin workspace while
keeping the public gallery open.

## Routes

| Route | Access | Purpose | Success Outcome | Failure Outcome |
|---|---|---|---|---|
| `/login` | Public | Minimal administrator sign-in entry | Starts Google OAuth flow | Error toast or inline error, remain on `/login` |
| `/confirm` | Public callback | Resolves Supabase callback and hydrates admin role | Admin returns to `/admin` after role check | Missing session or failed role lookup returns user to `/login` or `/` with feedback |
| `/admin` | Admin only | Gallery management workspace | Renders table and admin actions | Redirects to `/` when session missing or role is not admin |

## Authorization State

| Source | Contract |
|---|---|
| Authentication | `useSupabaseSession()` is the only source of truth for signed-in state |
| Authorization | Admin role is loaded from the existing Supabase `profiles` authorization source |
| Shared client state | `app/stores/auth.store.ts` exposes derived state such as `role`, `roleLoaded`, `isAuthenticated`, and `isAdmin` |
| Route guard | `app/middleware/auth.ts` blocks `app/pages/admin/**` until both session and admin role pass |

## Required Behaviors

- Unauthorized visits to `/admin` must redirect to `/`.
- `/login` must remain public even when a session is absent.
- `/confirm` must complete role hydration before allowing admin navigation.
- Client-side checks and Supabase RLS must agree on who may read records with `isActive = false`
  or mutate gallery data.

## Failure Handling

- Missing or expired session during callback returns the user to a safe public route.
- Role lookup failure is treated as non-admin access until resolved.
- Admin routes must never reveal records with `isActive = false` before authorization completes.
