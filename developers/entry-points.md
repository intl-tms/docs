# Entry points

Three audiences, three entries. Only the website entry carries a stability
promise; the editing-tool and Storybook entries change with the tools that
consume them, so pin an exact version if you build on them.

The list of public names on each entry is pinned by a test.

## `@intl-tms/core` (website)

| Group | Exports |
| --- | --- |
| Marker codec | `encode`, `decode`, `detect`, `strip` |
| Catalog | `markCatalog` |
| Toggle | `TOGGLE_COOKIE_NAME`, `TOGGLE_ON_VALUE` |
| Message classification | `tagNames`, `hasTags`, `isPlain`, `tagMismatch`, `isSharedKey`, `SHARED_NOTICE` |
| Configuration | `resolveConfig`, `ConfigError`, `PROTOCOL_VERSION`, `resolveEndpoint` |
| Wire helpers | `fieldText`, `writePatch`, `isEmptyPatch`, `conflictingColumns` |
| Usage helpers | `normalizeUrl`, `usageSignature` |
| Storage | `createMemoryAdapter`, `detectAdapterCapabilities`, `runAdapterConformance` |
| Handler | `createHandler` |

## `@intl-tms/core/tools` (editing tools)

| Group | Exports |
| --- | --- |
| Scanner | `scan` |
| Highlighter | `createHighlighter`, `highlightSettings`, `DEFAULT_COLORS`, `DEFAULT_SCAN_ATTRIBUTES` |
| Picker | `openPicker`, `closePicker` |
| Editing session | `createSession` |
| Client | `createClient`, `DEFAULT_TIME_LIMIT_MS`, `USAGE_COOLDOWN_MS` |
| Locale | `resolveLocale` |
| Usage helpers | `aggregateUsage`, `isHttpUrl` |
| Panel store | `createPanelStore` |
| Panel logic | `buildChanges`, `changedColumns`, `shouldRenderToolbar`, `resolveToolbarFilters`, `visibleLocales`, `hiddenErrors`, `usagePath`, `relativeTime`, `conflictNotice`, `explainSaveFailure`, `fieldText`, `PANEL_TEXT` |
| Shared rule | `isSharedKey`, `SHARED_NOTICE` |

### Building your own editing tool

The Extension and the [Storybook addon](./storybook) are two Hosts of the Core.
To build another, wire a session to a panel store. The Core ships both; the
view is yours, or the Core's built-in one (`createPanelView` from
`@intl-tms/core/storybook`).

```ts
import { createClient, createPanelStore, createSession } from "@intl-tms/core/tools";

const client = createClient({ getConfig: () => served /* GET {basePath}/config */ });
const panel = createPanelStore({ persist: (changes) => session.save(panel.getState().selection!.key, changes) });
const session = createSession({ sink: panel, client, getConfig: () => served, getLocale: () => document.documentElement.lang });
session.start(document);
```

The panel store is the session's sink directly. Render `panel.getState()`
however you like and subscribe with `panel.subscribe`.

## `@intl-tms/core/storybook` (Storybook addon)

| Group | Exports |
| --- | --- |
| Addon | `createStorybookAddon`, `EDIT_GLOBAL`, `STORYBOOK_TEXT` |
| Built-in panel | `createPanelView`, `createLog`, `PANEL_CSS`, `PANEL_VIEW_TEXT` |

`createStorybookAddon` is described in [The Storybook addon](./storybook).
`EDIT_GLOBAL` is the name of the Storybook global behind the toolbar switch
(`tmsEdit`, with the values `"on"` and `"off"`).

`createPanelView` is the addon's panel on its own: plain DOM over
`createPanelStore`, for a Host that wants a working panel without writing a
view. It is a session's sink directly, it includes the Diagnostics pane, and
`PANEL_CSS` is its stylesheet, written for a shadow root. `createLog` is the
diagnostic log, for a Host that wants to add entries of its own. This is the only view code in the Core, and the
other two entries do not reach it.

## Not built yet

The baseline is complete. These improvements are specified but deliberately
left for later: lazy and excluded Catalog marking, the gate helper, batch
writes, atomic conflicts, size limits on bodies, keys and values, incremental
and time-sliced scanning, bulk read and prefetch, request cancellation,
server-side message guards, rate limits, the diagnostics endpoint, localisable
panel text, undo, per-row save state, and real-browser tests.

## Working on the Core

```bash
npm test          # unit, contract, end-to-end and type-level tests
npm run typecheck # strict TypeScript, no unchecked index access
npm run lint      # eslint plus repository checks (platform imports, doc comments)
npm run build     # emits ESM and type declarations to dist/
npm run check     # all of the above
```
