# Storage adapter

The Core never stores anything. Where translations live, and how, is yours to
decide: a database, a CMS, files. You connect it by writing an adapter with
four operations, and that is the whole required surface.

```ts
import type {StorageAdapter} from '@intl-tms/core';
import type {config} from './config';

export const adapter: StorageAdapter<typeof config> = {
  // Every stored locale for the key, for example
  // {en: {value: 'Hello'}, da: {value: 'Hej'}}. Leave out a locale with no row.
  async getValues(key) {
    return {};
  },

  // Create or update the row for (key, write.locale).
  async saveValue(key, write) {},

  // The pages the key was seen on, most recently seen first.
  async getUsage(key) {
    return [];
  },

  // Create or update one row per (key, report.url).
  async reportUsage(report) {}
};
```

Pass it to `createHandler` as `adapter`.

## The contract

| Operation | Contract |
| --- | --- |
| `getValues(key)` | Every stored Locale for the key. **Sparse**: a Locale with no row is absent. Empty when nothing is stored. |
| `saveValue(key, write)` | Upsert one (key, Locale) as a **partial merge** of the supplied columns. A new row starts with an empty `value`. An empty string is a real value. Use `writePatch(write)`; an empty patch means do nothing. |
| `getUsage(key)` | A key's usages, most recently seen first. Empty when none. |
| `reportUsage(report)` | Upsert each (key, URL), overwriting count and last-seen. **Never prune.** |

An adapter never answers HTTP and never validates input: the handler hands it
only validated, rebuilt data.

An adapter typed for one configuration is a compile error to hand to a handler
built for another; an untyped adapter fits any configuration.

## Prove yours with the conformance suite

```ts
import { runAdapterConformance } from "@intl-tms/core";

const report = await runAdapterConformance(myAdapter, { locale: "en", fieldName: "status" });
expect(report.failures).toEqual([]);
```

The suite writes rows under keys that begin with `conformance:` and leaves
them there, so run it against a throwaway store.

## The memory adapter

`createMemoryAdapter()` is for tests and spikes only. It loses everything when
the process stops.

## Showing saved values on the page

Saving stores a value; rendering it is your website's job. Replace each
message with its stored value before calling `markCatalog`. How you read the
stored values, and whether every visitor or only an editing session sees them,
is up to you.

A key is the path to a message joined by `.`; the exact rule is in
[What marking does to strings](./marking#keys).
