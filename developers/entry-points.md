# Entry points

Two audiences, two entries. Only the website entry carries a stability promise;
the editing-tool entry changes with the tools that consume it, so pin an exact
version if you build on it.

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
