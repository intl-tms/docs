# Storage adapter

The Core never stores anything. You write an adapter with four operations, and
that is the whole required surface.

| Operation | Contract |
| --- | --- |
| `getValues(key)` | Every stored Locale for the key. **Sparse**: a Locale with no row is absent. Empty when nothing is stored. |
| `saveValue(key, write)` | Upsert one (key, Locale) as a **partial merge** of the supplied columns. A new row starts with an empty `value`. An empty string is a real value. Use `writePatch(write)`; an empty patch means do nothing. |
| `getUsage(key)` | A key's usages, most recently seen first. Empty when none. |
| `reportUsage(report)` | Upsert each (key, URL), overwriting count and last-seen. **Never prune.** |

An adapter typed for one configuration is a compile error to hand to a handler
built for another; an untyped adapter fits any configuration.

## Prove yours with the conformance suite

```ts
import { runAdapterConformance } from "@intl-tms/core";

const report = await runAdapterConformance(myAdapter, { locale: "en", fieldName: "status" });
expect(report.failures).toEqual([]);
```

## The memory adapter

`createMemoryAdapter()` is for tests and spikes only. It loses everything when
the process stops.

## A real example

The demo app's MongoDB adapter is a complete implementation in about a hundred
lines:
[`apps/web/src/tms/adapter.ts`](https://github.com/intl-tms/demo-app/blob/main/apps/web/src/tms/adapter.ts).
It keeps one document per (key, Locale) and one per (key, URL):

```ts
async saveValue(key, write) {
  const patch = writePatch(write);
  if (isEmptyPatch(patch)) return;
  await (await translations()).updateOne(
    { key, locale: write.locale },
    // A new row starts with an empty value; Mongo rejects a path that is in
    // both operators.
    { $set: patch, ...("value" in patch ? {} : { $setOnInsert: { value: "" } }) },
    { upsert: true }
  );
}
```

## Showing saved values on the page

Saving stores a value; rendering it is your website's job. Overlay the stored
values on your bundled messages before calling `markCatalog`, as the demo app
does in `src/tms/messages.ts`.
