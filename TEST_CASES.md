# App Home RemoteDom — Navigation Test Cases

Extension: `admin.app.home.render` via RemoteDom worker sandbox  
Router: `preact-iso` (`LocationProvider` + `Router` + `Route`)

---

## How to run

1. Start the dev server: `shopify app dev --config shopify.app.henry-hosted-app.toml --store henry-clone-ex-host`
2. Navigate to: `https://admin.shopify.com/store/henry-clone-ex-host/apps/henry-hosted-app/nav-test`
3. All interactive tests are on the **Navigation Test** page.

---

## TC-01 — Link navigation via `useLocation().route()`

**What it tests:** `location.route(path)` from preact-iso's `useLocation()` hook calls `history.pushState` internally, which our `historyFactory` forwards to admin-web via `protectedApi.navigation.navigate()`.

**Steps:**
1. Click **"Go to Sub-page Alpha"**

**Expected:**
- Admin URL bar changes to `.../nav-test/sub/alpha`
- Extension renders `NavTestSubPage` with heading "Sub-page: alpha"
- `pathname: /nav-test/sub/alpha` displayed
- `Param name: alpha` displayed (route param extraction works)

**Status:** ✅ Verified

---

## TC-02 — `history.pushState` programmatic navigation

**What it tests:** Direct `history.pushState(data, title, url)` call from within the worker.

**Steps:**
1. On the Navigation Test page, click **"pushState (new path)"**

**Expected:**
- Admin URL bar changes to `.../nav-test/pushed-XXXX`
- Extension re-renders (to NotFoundPage for this dynamic path, or a matched route if the path matches)
- Event log shows `pushState(/nav-test/pushed-XXXX)`

**Status:** ✅ Verified

---

## TC-03 — `history.replaceState` (no new history entry)

**What it tests:** `replaceState` updates URL without adding a history entry; pressing Back after `replaceState` skips the replaced step.

**Steps:**
1. Navigate to Sub-page Alpha first (to create a history entry)
2. Click **"replaceState (same stack slot)"**
3. Press browser Back (TC-09)

**Expected:**
- URL updates after step 2 (no page transition since path doesn't match a route)
- After Back in step 3, URL goes to the page *before* step 1 (the replaced entry is gone)
- Event log shows `replaceState(/nav-test/replaced-XXXX)`

**Status:** ✅ Implemented (verify manually: replaceState doesn't appear in back stack)

---

## TC-04 — `history.back()` from within the extension

**What it tests:** Worker calls `history.back()` → `historyFactory` calls `protectedApi.navigation.pop()` → admin-web calls `router.navigate(-1)`.

**Steps:**
1. Navigate to Sub-page Alpha
2. Click **"history.back()"** on the sub-page

**Expected:**
- Admin URL bar returns to `.../nav-test`
- Extension re-renders NavTestPage

**Status:** ✅ Verified

---

## TC-05 — `history.forward()` from within the extension

**What it tests:** Worker calls `history.forward()` → `historyFactory` calls `protectedApi.navigation.forward()` → admin-web calls `router.navigate(1)`.

**Steps:**
1. Navigate to Sub-page Alpha, then click Back
2. Click **"history.forward()"**

**Expected:**
- Admin URL bar advances to `.../nav-test/sub/alpha`
- Extension re-renders NavTestSubPage

**Status:** ✅ Implemented (verify manually)

---

## TC-06 — `history.go(delta)` with arbitrary delta

**What it tests:** Worker calls `history.go(-2)` → `historyFactory` calls `protectedApi.navigation.go(-2)` → admin-web calls `router.navigate(-2)`.

**Steps:**
1. Navigate: Home → Nav Test → Sub-page Alpha  (3 entries)
2. Click **"history.go(-2)"** from Sub-page Alpha

**Expected:**
- Admin URL bar jumps back 2 entries to Home
- Extension re-renders HomePage

**Status:** ✅ Implemented (verify manually)

---

## TC-07 — URL bar in admin reflects `pushState` path

**What it tests:** After `history.pushState`, the admin URL bar (top frame) updates to show the new path.

**Steps:**
1. Click **"pushState (new path)"**

**Expected:**
- Admin URL bar changes from `.../nav-test` to `.../nav-test/pushed-XXXX` within 1–2 seconds

**Status:** ✅ Verified

---

## TC-08 — `window.location` properties are readable

**What it tests:** `locationFactory` polyfills `window.location.pathname`, `.search`, `.href`, and `history.state` correctly inside the worker.

**Steps:**
1. Load the Navigation Test page at `/nav-test`

**Expected (TC-08 section):**
- `pathname: /nav-test`
- `search: (none)`
- `href: https://extensions.shopifycdn.com/nav-test`
- `history.state: null`

After clicking "pushState (new path)":
- `pathname: /nav-test/pushed-XXXX`
- `history.state: {"source":"test"}`

**Status:** ✅ Verified

---

## TC-09 — Browser Back button triggers `popstate` → preact-iso re-renders

**What it tests:** When the user presses the browser Back button, admin-web's react-router goes back, `navigationPlugin`'s `currentEntry` signal updates, `locationFactory`'s subscriber fires `popstate`, preact-iso re-renders.

**Steps:**
1. From the Navigation Test page, click "Go to Sub-page Alpha"
2. Use the **browser Back button** (not the in-extension button) to go back

**Expected:**
- Admin URL bar returns to `.../nav-test`
- Extension re-renders NavTestPage
- Event log shows `popstate → pathname=/nav-test`

**Status:** ✅ Verified (popstate fires on external navigation)

---

## TC-10 — Browser Forward button triggers `popstate` → preact-iso re-renders

**What it tests:** Symmetric to TC-09, but using the Forward button.

**Steps:**
1. Navigate to Sub-page Alpha, press Back
2. Use the **browser Forward button**

**Expected:**
- Admin URL bar advances to `.../nav-test/sub/alpha`
- Extension re-renders NavTestSubPage
- Event log on NavTestPage shows `popstate → pathname=/nav-test/sub/alpha`

**Status:** ✅ Implemented (verify manually)

---

## TC-11 — Direct deep-link: load extension at a sub-path

**What it tests:** When the admin URL is already at a deep path when the extension loads, `navigationPlugin` computes the correct initial `currentEntry.url`, `locationFactory` initializes `localLocation` correctly, and preact-iso renders the right route on first mount.

**Steps:**
1. Navigate directly to: `.../nav-test/sub/alpha` (paste in address bar or use a fresh tab)

**Expected:**
- Extension renders NavTestSubPage (not HomePage or NotFoundPage)
- `pathname: /nav-test/sub/alpha`
- `Param name: alpha`

**Status:** ✅ Verified

---

## TC-12 — `window.location.pathname` is synchronous after `pushState`

**What it tests:** After `history.pushState('/new/path', '', '/new/path')`, reading `window.location.pathname` immediately (synchronously, before the async admin-web round-trip) returns the new path. This is what preact-iso does after calling pushState.

**Steps:**
1. Open browser DevTools console on the extension worker (or add inline assertion)
2. Call: `history.pushState(null, '', '/test-sync'); console.log(window.location.pathname)`

**Expected:**
- Console logs `/test-sync` immediately (not the old path)

**Status:** ✅ Verified by design — `historyFactory.pushState` updates `sharedState.localLocation` synchronously before calling `navigateHost`

---

## Known limitations / deferred

| Behavior | Status |
|----------|--------|
| `history.length` accurate count | ⚠️ Lower-bound only (incremented on pushState, never decremented) |
| `history.forward()` when no forward history exists | ⚠️ No-op (correct per spec, but no canGoForward check) |
| `history.go(+N)` requires `forward?()` support from host | ⚠️ Falls back to repeated `forward()` calls |
| `window.location.reload()` | ⚠️ No-op (deferred: would need to re-run the worker module) |
| `window.location.replace()` creates history entry | ⚠️ Should not create history entry (same as replaceState), currently does |
| `s-button href` / `s-link href` click navigation | ⚠️ Does NOT work for SPA routing — use `onclick` + `location.route()` or `history.pushState` |
| `<a href>` tag interception by preact-iso | ⚠️ Not verified (preact-iso intercepts click events on `<a>` tags; RemoteDom event proxy might not match `event.target` to `<a>`) |
