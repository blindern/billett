# Angular signals & zoneless migration

Status: not started. Baseline is `0cab6dc` (Angular 22 + TypeScript 6.0.3, merged 2026-09-20 UTC).

## Why

Angular 22 changed the default change detection strategy from `Default`/`Eager` to `OnPush`.
All 46 components relied on the old default, so the upgrade PR applied Angular's official
`change-detection-eager` migration and pinned every component to
`ChangeDetectionStrategy.Eager`. That preserved behaviour and made the upgrade shippable, but
it is a bridge, not a destination.

The underlying pattern is pre-signals: 91 `.subscribe(` calls assign to plain fields, there are
36 `@Input()` decorators, zero signals, and zero `markForCheck`. Change detection works only
because zone.js monkey-patches every async browser API and re-checks the whole component tree
on any event.

Destination: signals throughout, then zoneless. That removes zone.js (36 KB minified) from the
bundle and replaces whole-tree checking with updates targeted at the views that actually read
the changed value.

## Scope inventory

Do not scope this work by `ResourceLoadingState` alone — that abstraction covers only half the
problem.

| Population | Count | Where |
|---|---|---|
| Components | 46 | all currently `ChangeDetectionStrategy.Eager` |
| `.subscribe(` calls | 91 | across `frontend/src` |
| …inside the 22 `ResourceLoadingState` consumer files | 69 | slices 1 and 2 |
| …of those, actual `.pipe(handleResourceLoadingStates(` | 24 | the `rxResource` conversion proper |
| …**the other 45** — dialog `.closed`, mutations, reloads | 45 | **also slices 1 and 2** — see warning below |
| …inside the 17 files with no loading state | 22 | slices 1 and 3 |
| Files referencing `ResourceLoadingState` | 24 | = 22 consumers + the definition + `PageStatesComponent` |
| `@Input()` decorators | 36 | converted alongside the component that owns them |
| Files using `ngOnChanges` | 21 | slices 1 and 2 |

Zoneless is only safe once **all 91** subscribes are signal-driven or explicitly marked.

> **Do not size slice 2 by the loading pipes.** Only 24 of the 69 subscribes in those files are
> the `handleResourceLoadingStates` pipe; the other 45 are dialog `.closed.subscribe(...)`,
> mutation calls and manual reloads. `admin-paymentgroup-list` is typical — two loading pipes
> and one `.closed.subscribe`. A slice that converts only the pipes leaves its own file half
> reactive, and those leftovers break under zoneless exactly like the slice-3 ones.
> (An earlier draft said "47 piped / 44 unpiped". That 47 was a grep over identifier
> *occurrences* — 24 real pipes plus 22 import lines plus the definition — so the 44 was
> meaningless.)

Every one of the 46 components falls into exactly one class, and all three must be converted —
an earlier draft of this plan covered only the first two and would have left 10 components on
`Eager` forever:

| Class | Count | What it needs |
|---|---|---|
| `LOADING` — uses `ResourceLoadingState` | 23 | `rxResource` (includes `PageStatesComponent`) |
| `SUBSCRIBE` — subscribes, no loading state | 13 | `toSignal` / `signal()` / `async` pipe |
| presentational — neither | 10 | nothing but the `OnPush` flip |

Plus 4 non-components that subscribe: `auth.service`, `page.service`, `navigation.service`,
`active-for.directive`.

### Ordering invariant

**Never flip a component to `OnPush` while anything it renders still relies on `Eager`.**

Angular skips a non-dirty OnPush view *and its whole subtree*, so an unconverted child under a
converted parent silently stops updating. Conversion therefore goes bottom-up. The shared leaves
and their parent counts:

```
page-property        23 parents      admin-paymentgroup-selectbox   4 parents
page-states          17 parents      admin-printer-selectbox        3 parents
page-loading/404      1 (page-states) markdown                      4 parents
pagination            2 parents      eventlist-item                 2 parents
admin-event-form      2 parents      toast-container                1 (app)
```

The trap this invariant catches: `eventlist-item` is a `SUBSCRIBE` component but a child of
`guest-eventgroup` and `guest-index`, both `LOADING`. Converting the pages before the item
would starve it. `app.component` is the root and converts last.

## Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Migration is separate from the Angular 22 upgrade | The upgrade was a version bump; this is behavioural change across most of the app. Bundling them would make a broken checkout page and a broken framework upgrade one unbisectable diff. |
| 2 | Each slice flips its own components to `OnPush` as it converts them, **bottom-up** | Change detection strategy is per-component, so a half-migrated app is valid — but only in one direction. Angular skips an OnPush view's entire subtree when that view is not dirty, so a still-`Eager` child of a converted OnPush parent stops being refreshed. Converting leaves first spreads the behavioural risk across slices instead of concentrating it in a big-bang cutover, and is the only ordering that is actually safe. See the invariant below. |
| 3 | Playwright + mocked API safety net lands *before* any conversion | The failure mode is always "data arrived, DOM did not update". That needs a browser, but not a backend. |
| 4 | `rxResource`, services retained | Services encode `params: { admin: "1" }`, which decides whether the API returns full or Guest-shaped models. Omitting it fails silently with thinner objects rather than erroring. That rule belongs in 18 services, not scattered across 22 call sites. `httpResource` *can* issue writes (`HttpResourceRequest` has `method` and `body`), but it is a reactive read primitive — it re-fetches whenever its request signal changes, which is the wrong shape for one-shot imperative mutations. So the mutation methods stay in services either way. |
| 5 | Lint ratchet: rule ON globally, rule-scoped `eslint-disable` on the 46 | New components are OnPush-first automatically, with no allowlist to drift. Requires `--max-warnings 0` to actually bite — see slice 0. |

### Rejected alternatives

- **`httpResource` in components** — idiomatic and removes an indirection, but scatters `api()`
  and the `admin=1` rule across 22+ call sites where omitting it degrades silently.
- **Services returning `ResourceRef`** — strongest encapsulation, but resources bind to an
  injection context and per-caller reactive params, which fits badly with root-provided services.
- **Migrating during the Angular 22 PR** — largest untested change in the app's history landing
  on production via auto-deploy.
- **Keeping `Eager` permanently** — supported (it is an alias for the old `Default`, not a
  deprecation), but leaves the app on zone.js indefinitely.
- **One mechanical "delete all `Eager`" slice at the end** — rejected after review. The lint rule
  checks only the annotation, never whether a component actually renders under OnPush, so such a
  slice would flip behaviour for all 46 components at once while appearing to be the safest step
  in the plan.

## Slices

Each slice is a separate PR. Every slice that converts components must also, for each component
it converts: drop the `eslint-disable` comment, remove the `ChangeDetectionStrategy.Eager` line,
and extend the slice-0 suite to cover that screen.

### Slice 0 — safety net and CI plumbing

No component changes. Everything downstream is gated on this.

**Tests.** New `e2e-tests/src/render.spec.ts`, tagged `@render`. Per screen, assert both halves
of the failure mode:

- data reached the DOM — `await expect(page.getByText(...)).toBeVisible()`
- spinner resolved — `await expect(page.locator("billett-page-loading")).toHaveCount(0)`

Include at least one 404 case, so error rendering is covered by a test rather than by reasoning
(see slice 1).

**Serving.** Playwright must serve the built frontend itself — there is no static server in
`e2e-tests/` today and no `webServer` block in `playwright.config.ts`. Add one, but **gate it**:

```ts
...(process.env.RENDER_SERVER
  ? {
      webServer: {
        command: "pnpm dlx serve -s ../frontend/dist/billett/browser -l 4200",
        url: "http://localhost:4200",
        reuseExistingServer: !process.env.CI,
      },
    }
  : {}),
```

The gate is essential. Playwright starts `webServer` on **every** run of this config regardless
of `--grep`, and three other jobs share it: the hourly production monitor and `run-e2e-tests.yml`
called twice (`@frontend` post-deploy and `@api`). None of them builds the frontend, so
`../frontend/dist/billett/browser` would not exist, the server would never come up, and all
three would fail. `--grep-invert @render` does **not** prevent that. A second Playwright project
or config file is an equally good alternative.

The render step must also set `BASE_URL=http://localhost:4200`. `playwright.config.ts` defaults
`baseURL` to `https://billett.blindernuka.no`, so without it `page.goto("/")` would hit
production while the local server sits idle.

Port 4200 is deliberate. `frontend/src/api.ts` special-cases port **3000** to rewrite the API
origin to `:8081`; serving on 4200 keeps the API origin same-origin, so `page.route()` globs
match `**/api/**`. Do not serve on 3000. Note it also honours a `billett-baseurl` localStorage
override, so tests must not set one.

**Auth.** Four of the screens sit under `/a/*` behind `requireAdmin`
(`src/auth/require-admin.ts`), which awaits `GET /api/me` and, when not logged in, sets
`window.location.href` to the SAML2 endpoint — navigating off-app. Mock `/api/me` with an
`ApiAuthInfo` shape (`logged_in`, `is_admin`, `csrf_token`) **before the first `page.goto`**.

**CI wiring — three separate changes, all required.**

1. `.github/workflows/frontend.yml`: add `e2e-tests/**` to `paths`, so a PR touching only the
   tests still runs them. **Caveat:** on `main` this workflow also builds, pushes the image and
   POSTs to the deployer — so as written, a test-only commit would redeploy production. Guard the
   build/deploy steps with a path filter, or accept the redeploy deliberately.
2. `.github/workflows/frontend.yml`: run the render tests after `pnpm run build`, with
   `RENDER_SERVER=1` and `BASE_URL=http://localhost:4200`. Prefer **extending the existing
   reusable `run-e2e-tests.yml`** with a `serve-local` input over pasting a third copy of the
   pnpm/node/`playwright install` setup — `frontend.yml` already calls that workflow for
   `@frontend`. Note the job sets `defaults.run.working-directory: frontend`, so any inline steps
   need their own `working-directory`.
3. `.github/workflows/e2e-tests.yml`: this is the **hourly production monitor** (cron
   `35 5-22 * * *`, `BASE_URL` defaulting to `https://billett.blindernuka.no`, Slack alert on
   failure). Its step is `pnpm test`, which is `playwright test` with no `--grep`, so it would
   pick up the `@render` tests and run mock-dependent tests against production 18 times a day.
   Change **the workflow step** to `pnpm exec playwright test --grep-invert @render` — do not
   edit the `test` script in `package.json`, which local development also uses.

`frontend.yml` has no `pull_request` trigger — it is `push` + `workflow_dispatch`. Decide whether
to add one or rely on push-to-branch. "Runs pre-merge on every PR" is not true today.

**Ratchet.** This lands 46 `eslint-disable` comments plus the `eslint.config.js` flip — a
47-file frontend diff on top of the test work. Keep it as its own commit, or its own PR, so the
review signal is not lost in the noise.

Turn `@angular-eslint/prefer-on-push-component-change-detection` back on globally
and add a **rule-scoped** disable to each of the 46 — never a bare `eslint-disable`, which would
switch off every rule for that file:

```ts
/* eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection */
changeDetection: ChangeDetectionStrategy.Eager,
```
 This only bites if lint also fails on
warnings: change `frontend/package.json`'s `"lint": "eslint ."` to `eslint . --max-warnings 0`,
or set `linterOptions.reportUnusedDisableDirectives: "error"` in `eslint.config.js`. Without
that, a component retaining both its `Eager` line and its disable comment lints clean forever,
and orphaned directives never fail the build.

**Screens.** Derive from the slice-2 list below rather than guessing. Minimum for slice 2 to
proceed: `guest/eventgroup`, `guest/event`, `guest/order`, `guest/index`,
`admin-eventgroup-sold-tickets-stats`, `admin-ticketgroup-item`, `admin-order-item`,
`admin-event-checkin`, `admin-paymentgroup-item`, `admin-paymentgroup-list`. The
sold-tickets-stats and ticketgroup screens are money-facing and must not be skipped.

### Slice 1 — shared leaves

Everything rendered *inside* another component, converted and flipped to `OnPush` before any of
its parents. 14 components: the 10 presentational ones, plus `page-states`, `eventlist-item`,
`admin-paymentgroup-selectbox` and `admin-printer-selectbox`.

Most of the 10 presentational components need only the flip — delete the `Eager` line and the
disable comment, no logic change. `eventlist-item` needs its subscribe converted. The two
selectboxes use `ResourceLoadingState`, so they get the slice-2 `rxResource` treatment early,
because their parents are modals converted later.

`PageStatesComponent` is the important one and must land here: `src/common/page-states.component.ts`
imports `ResourceLoadingState` and declares `@Input() state!: ResourceLoadingState`, so slice 2
cannot delete `common/resource-loading.ts` while this still references it.

Change it to take `isLoading: Signal<boolean>` and `error: Signal<Error | undefined>` (or accept
both shapes for one slice, so consumers can migrate incrementally).

**The error type changes, not just the input shape.** `Resource.error` is
`Signal<Error | undefined>`, whereas `PageStatesComponent.isNotFound` and
`getErrorText`/`getValidationError` (`src/common/errors.ts`) branch on
`error instanceof HttpErrorResponse`. That keeps working because `HttpErrorResponse extends
HttpResponseBase implements Error`, so it satisfies `Error` structurally and Angular passes it
through unwrapped. This is sound, but it is the reason the slice-0 suite needs a 404 assertion.

### Slice 2 — `rxResource` replaces `ResourceLoadingState`

The remaining 20 `LOADING` components — the 22 consumers listed below, minus the two selectboxes
already done in slice 1. Delete `common/resource-loading.ts` at the end of the slice.

This slice necessarily also converts the route-bound `@Input()`s of every file it touches —
`rxResource`'s `params` must be reactive, so `@Input() id!: string` plus `ngOnChanges` becomes a
signal input in the same edit. That is not scope creep; the two cannot be separated.

```ts
// service unchanged
get(id: string) {
  return this.http.get<AdminEventData>(api(`event/${id}`), { params: { admin: "1" } })
}

// component
id = input.required<string>()
event = rxResource({
  params: () => this.id(),
  stream: ({ params }) => this.svc.get(params),
})
```

`composeResourceLoadingStates` (one caller, `admin-paymentgroup-list.component.ts`) composes
**both** `loading` and `error` — replace both halves:

```ts
isLoading = computed(() => this.a.isLoading() || this.b.isLoading())
error = computed(() => this.a.error() ?? this.b.error())
```

That same caller fires its second request inside the first's subscribe (`:64`), i.e. a dependent
resource. Express it as `params: () => this.eventgroup.value()?.id` rather than nesting.

Consumers (22):

```
admin/daytheme/admin-daytheme-create          admin/paymentgroup/admin-paymentgroup-item
admin/event/admin-event                        admin/paymentgroup/admin-paymentgroup-list
admin/event/admin-event-checkin                admin/paymentgroup/admin-paymentgroup-selectbox
admin/event/admin-event-create                 admin/printer/admin-printer-selectbox
admin/event/admin-event-edit                   admin/ticketgroup/admin-ticketgroup-add-to-order-modal
admin/eventgroup/admin-eventgroup              admin/ticketgroup/admin-ticketgroup-create
admin/eventgroup/admin-eventgroup-edit         admin/ticketgroup/admin-ticketgroup-item
admin/eventgroup/admin-eventgroup-sold-tickets-stats
admin/index/index                              guest/event/event
admin/order/admin-order-create                 guest/eventgroup/eventgroup
admin/order/admin-order-item                   guest/index/index
                                               guest/order/order
```

### Slice 3 — the non-loading subscribes

The gap the first draft of this plan missed entirely: 17 files hold 22 subscribes that never
touch `ResourceLoadingState`, so no other slice reaches them, yet every one breaks under
zoneless. Convert with `toSignal`, explicit `signal()` writes, or the `async` pipe.

`eventlist-item` is already done in slice 1 (it is a leaf under two slice-2 pages), leaving 16
files here. `app.component` is the root — convert it **last**, since flipping the root to OnPush
while anything below it is unconverted would starve the entire tree.

The 17 files in total, by slice:

```
app.component.ts                                  admin/printer/admin-printer-select-modal
auth/auth.service.ts                              admin/printer/admin-printer-text-modal
auth/logout.component.ts                          admin/ticket/admin-ticket-revoke-modal
common/active-for.directive.ts                    admin/order/admin-order-email-modal
common/navigation.service.ts                      admin/order/admin-order-list
common/page.service.ts                            admin/payment/admin-payment-create-modal
guest/eventgroup/eventlist-item.component.ts      admin/paymentgroup/admin-paymentgroup-create-modal
admin/eventgroup/admin-eventgroup-create          admin/paymentgroup/admin-paymentgroup-select-modal
admin/paymentgroup/admin-paymentsource-create-modal
```

Two worth calling out, because they fail silently rather than loudly:

- `app.component.ts` — a nested subscribe sets `this.loggedInButNoAccess = true`. Under zoneless
  the "logged in but no access" banner never appears.
- `admin-order-list.component.ts` — `this.search` is assigned inside a `queryParams` subscribe
  and `this.orders` inside a debounced one. Under zoneless, admin order search renders nothing.

At the end of this slice no component should retain `Eager` or an `eslint-disable`; with
`--max-warnings 0` in place, any leftover fails CI. Cross-check: 23 `LOADING` + 13 `SUBSCRIBE` +
10 presentational = 46, so every component is accounted for across slices 1-3.

### Slice 4 — zoneless

Swap `provideZoneChangeDetection({ eventCoalescing: true })` for
`provideZonelessChangeDetection()`, drop `zone.js` from dependencies and from the `polyfills`
array in `angular.json` (**both** the build and test targets).

Verify jQuery and Bootstrap 3 behaviour by hand here — dropdowns, modals, collapse.

Update `CLAUDE.md` in this slice — removing zone.js changes how change detection works for
every future session reading it. (The stale "Angular 21" line there was already corrected.)

## Assumptions (unverified)

- **`Eager` preserves pre-22 behaviour exactly.** Reasoned from it being Angular's own migration
  and an alias for the old `Default` — not demonstrated. The repo has zero unit tests. Slice 0 is
  the first thing that could show otherwise.
- **jQuery and Bootstrap 3's JS are zoneless-safe.** They only do DOM effects and never touch
  Angular component state. Verify during slice 4.
- **Mocked-API Playwright tests catch the stuck-spinner class.** Validate slice 0 by deliberately
  breaking a component and confirming the suite goes red — do not assume it.
- **The `<datalist>` swap preserves the field's behaviour.** `datalist` opens on typing rather
  than on focus, which `taDisplayOnFocus` did. Confirm with the slice-0 render test before
  removing the dependency.

## Verified facts

Verified against `0cab6dc` and a `@angular/core@22.1.7` tree on 2026-09-21.

- Counts in the inventory table above.
- Routes are flat — no `children` in any of the 7 `routes.ts` — so Angular 22's
  `paramsInheritanceStrategy: 'always'` default change is a no-op here.
- `rxResource` and `httpResource` are `@publicApi 22.0`; `provideZonelessChangeDetection` is
  `@publicApi 20.2`. (Checking this in `frontend/node_modules` can mislead — that tree may be
  stale at 21.2.15, where `rxResource` is still `@experimental`. Run `pnpm install` first.)
- Existing e2e is one smoke test that loads `/` and asserts `<body>` is visible. It passes with
  every page stuck on a spinner.
- `@angular/animations` and `@angular/platform-browser-dynamic` were imported nowhere and have been removed.

## Operating constraints

**Recovery is roll-forward only.** The deployer redeploys whatever image digest it is POSTed, so
reverting is mechanically possible, but no rollback tooling is being built — fix and merge. That
makes merge timing the real risk control.

**Deploy timing is a judgement call, not a gate.** Slices deploy on merge, so merge them outside
active ticket-sale windows. Deliberately not enforced in CI: no freeze config to maintain.

**Nothing verifies UI behaviour until slice 0 exists.** Until the render suite is in place, CI
proves only that the app compiles and lints. Any change that alters what a screen does should
wait for slice 0 — that is the whole reason slice 0 is first.

## Open questions

None outstanding. Settled so far:

- Rollback — roll forward only, no tooling.
- Deploy timing — judgement per slice, no enforced freeze.
- `ngx-typeahead` — replace with a native `<datalist>`. The input is already `[(ngModel)]`-bound,
  so it is a drop-in: add `list=`, add the `<datalist>`, delete the four `ta*` attributes, the
  import and the dependency. **Scheduled for after slice 0**, since it changes admin UI behaviour
  and nothing can verify that today.
- `@angular/animations` and `@angular/platform-browser-dynamic` — deleted (imported nowhere;
  removal is provable by the existing build).

## Non-goals

- **Bootstrap 3 and jQuery.** EOL since 2019 and the largest legacy surface in the frontend, but
  replacing them is a visual-redesign program, not a change-detection one. Explicitly out of
  scope so it reads as a choice rather than an oversight.
- **TypeScript 7.** Angular 22 pins `>=6.0.0 <6.1.0`. Renovate will keep proposing it; it stays
  blocked until Angular supports it.
