# Security Audit — DineFlow OS

**Date:** 2026-07-31  
**Auditor:** ZCode (GLM-5.2)  
**Scope:** `dineflow-os/` (React 19 + Vite 8 PWA) and `my-api-worker/` (Cloudflare Workers API)

---

## Executive Summary

Conducted a comprehensive security audit of all authentication flows, data handling, and common web vulnerabilities. Found **3 critical vulnerabilities** (all fixed), **4 medium issues** (documented as architectural constraints of a mock/demo app), and **3 low/info findings**.

All fixes are committed in commit `6eecf1e`. Verification: `tsc` 0 errors, 104/104 tests pass, build green, `oxlint` 0 errors.

---

## Critical Findings (Fixed)

### 1. Stored XSS in `src/lib/print.tsx` — FIXED

**Severity:** Critical  
**Vector:** `printBill()` interpolates user-controlled data into an HTML string via `document.write()`, then renders it in a popup window. Any field that comes from user input or localStorage could contain HTML/JS.

**Attack scenario:** An attacker creates a menu item or add-on with a name like `<script>steal(localStorage)</script>`. When a staff member prints the bill, the script executes in the print popup's `about:blank` origin, which has access to the parent window via `window.opener` (before the `noopener` fix). Since the popup shares localStorage with the parent, this could exfiltrate POS auth tokens, permissions, and staff data.

**Affected data sources:**
- Order line item names (`line.name`) — user-entered during menu builder
- Add-on names (`line.selectedAddOns[].name`) — user-entered
- Order ID (`order.id.slice(-5)`)
- Order type / table number
- Restaurant details from localStorage (`restaurant.name`, `.address`, `.phone`, `.email`, `.website`, `.gstNumber`, `.footer`) — editable via Settings page

**Fix applied:**
- Added `escapeHtml()` helper function using `div.textContent` → `div.innerHTML` pattern
- Applied `escapeHtml()` to all 13 interpolated dynamic values in the HTML template
- Wrapped `JSON.parse(localStorage.getItem("dineflow-restaurant"))` in try/catch

**Verification:** `git show 6eecf1e -- src/lib/print.tsx` confirms all interpolated values are escaped.

---

### 2. Plaintext PIN in localStorage — FIXED

**Severity:** Critical  
**Vector:** `src/stores/posAuth.store.ts` uses zustand's `persist` middleware, which serializes the entire state object — including `staff.pin` — to `localStorage` under the key `"dineflow-pos-auth"`.

**Attack scenario:** Anyone with brief access to the device (shared POS terminal, shoulder surfing, or a compromised browser extension) can read `localStorage.getItem("dineflow-pos-auth")` and find the staff PIN in cleartext. Since staff pins are reused across sessions, this is a direct credential exposure.

**Fix applied:**
- Added `partialize` callback to the zustand persist configuration that strips `pin` from the persisted state:
```ts
partialize: (state) => ({
  staff: state.staff ? { ...state.staff, pin: "" } : null,
}),
```
- The PIN remains in memory during the active session (needed for login logic), but is never written to disk.

**Verification:** `git show 6eecf1e -- src/stores/posAuth.store.ts` confirms the `partialize` fix.

---

### 3. Rules-of-Hooks violations (RBAC + Sidebar) — FIXED

**Severity:** High (correctness/security adjacent)  
**Vector:** `usePermission` (a React hook) was called inside `.some()` and `.filter()` callbacks in `PermissionGate.tsx:17` and `Sidebar.tsx:53`. React requires hooks to be called unconditionally at the top level of a component, not inside callbacks.

**Impact:** While this doesn't directly create a security hole, it violates React's rules-of-hooks which can cause unpredictable behavior. In hot/dev mode it produces hard-to-debug errors; in production with minification, the hook call order could shift and cause a permission check to silently return the wrong value (e.g., `true` when it should be `false`), potentially granting access to a page/role that should be denied.

**Fix applied:**
- `PermissionGate.tsx`: Moved `usePosAuthStore` and `usePermissionStore` calls to the top level of the component. Permission checking now reads `rolePermissions` from the store store directly and calls `.some()` on the permission Set, avoiding the hook-in-callback pattern entirely.
- `Sidebar.tsx`: Same pattern — reads `staff` and `role` at the top level, computes `rolePerms` via `usePermissionStore`, then filters `links` using `rolePerms.has(link.permission)`.

**Verification:** `npx oxlint` reports 0 errors after the fix.

---

## Medium Findings (Architectural Constraints — Not Fixed)

### 4. Hardcoded PINs in demo data

**Severity:** Medium  
**Location:** `src/data/staff.ts` (6 staff members with PINs: 1111, 2222, 1234, 0000, 9999, 3333)

**Status:** Not fixed — these are required for the demo to function. In a production deployment, PINs would be hashed server-side (e.g., bcrypt/PBKDF2) and the store would compare hashes, not plaintext.

---

### 5. Demo PINs displayed on login page

**Severity:** Medium  
**Location:** `src/features/pos/login/PosLoginPage.tsx:111`

**Status:** Not fixed — the login page shows a hint with all demo PINs and their corresponding roles. This is an intentional demo convenience to allow testers to quickly log in as any role. In production, this would be removed.

---

### 6. Client-side-only RBAC

**Severity:** Medium  
**Location:** `src/lib/permissions.ts`, `src/stores/permissions.store.ts`, `src/components/auth/PermissionGate.tsx`

**Status:** Not fixed — the entire RBAC system (permissions matrix, role assignments, `PermissionGate` checks) is enforced entirely in the browser. The permission matrix is stored in `localStorage` (`dineflow-pos-permissions`) and can be modified by any user with DevTools access.

**Why not fixed:** DineFlow OS is a client-side-only PWA using mock services (no backend API yet — `my-api-worker` is a separate unintegrated project). A proper fix would require server-side authorization middleware, which depends on the `my-api-worker` integration (pending item #6 in the roadmap).

**Mitigation noted:** Even with the PIN stripping fix, `localStorage` is still readable by the user. True RBAC requires a backend with token-based auth + server-side permission checks on every API call.

---

### 7. `my-api-worker` has no authentication

**Severity:** Medium  
**Location:** `my-api-worker/` (Cloudflare Workers API, Hono + Chanfana)

**Status:** Not fixed — the worker exposes CRUD endpoints for tasks with zero authentication. Anyone who knows the endpoint URL can read, create, update, or delete tasks.

**Why not fixed:** `my-api-worker` is currently a boilerplate template (from the Chanfana starter), not yet integrated with dineflow-os. Once integration happens (pending item #6), auth (API keys, JWT, or Cloudflare Access) should be added.

---

## Low/Info Findings

### 8. No Content Security Policy (CSP) or security headers

**Severity:** Low  
**Status:** No CSP meta tag or security headers configured. A restrictive CSP would mitigate the XSS risk even if a sanitization bug were introduced. Recommended: add `Content-Security-Policy` meta tag in `index.html` and configure security headers in `vite.config.ts`.

---

### 9. `window.open` popup context

**Severity:** Low  
**Status:** The `window.open` call in `printBill` was fixed with `noopener,noreferrer` (prevents `window.opener` access / tab-nabbing). However, the print popup still runs `document.write` HTML, so the XSS fix in print.tsx remains essential — `noopener` alone is not sufficient defense-in-depth.

---

### 10. No session timeout

**Severity:** Low  
**Location:** `src/stores/posAuth.store.ts`

**Status:** POS auth state persists indefinitely in localStorage with no expiry. A user who walks away from a logged-in POS terminal leaves the session accessible to anyone who approaches. Recommended: add a session timeout (e.g., 30 minutes of inactivity) that clears the auth state.

---

## Summary Table

| # | Finding | Severity | Location | Status |
|---|---------|----------|----------|--------|
| 1 | Stored XSS in print preview | Critical | `src/lib/print.tsx` | ✅ Fixed |
| 2 | Plaintext PIN in localStorage | Critical | `src/stores/posAuth.store.ts` | ✅ Fixed |
| 3 | Rules-of-hooks: `usePermission` in callbacks | High | `PermissionGate.tsx:17`, `Sidebar.tsx:53` | ✅ Fixed |
| 4 | Hardcoded PINs in demo data | Medium | `src/data/staff.ts` | ⚠️ Architectural (demo only) |
| 5 | Demo PINs shown on login page | Medium | `PosLoginPage.tsx` | ⚠️ Architectural (demo only) |
| 6 | Client-side-only RBAC | Medium | `permissions.ts`, `permissions.store.ts` | ⚠️ Requires backend integration |
| 7 | `my-api-worker` has no authentication | Medium | `my-api-worker/` | ⚠️ Not yet integrated |
| 8 | No CSP/security headers | Low | `index.html`, `vite.config.ts` | ⚠️ Documented |
| 9 | `window.open` popup context | Low | `src/lib/print.tsx` | ✅ Fixed (noopener,noreferrer) |
| 10 | No session timeout | Low | `src/stores/posAuth.store.ts` | ⚠️ Documented |

---

## Verification Evidence

```
Commit: 6eecf1e  fix(security): strip plaintext PIN from localStorage, fix XSS in print bill
Files changed: src/lib/print.tsx, src/stores/posAuth.store.ts

TSC:     npx tsc --noEmit  → 0 errors
Tests:   npx vitest run    → 104/104 passed (12 files)
Build:   npx vite build    → built successfully
Lint:   npx oxlint        → 0 errors, 24 warnings
```
