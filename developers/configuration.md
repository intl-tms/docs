# Configuration

`resolveConfig` validates your setup at boot and throws a `ConfigError` naming
the offending value.

```ts
resolveConfig({
  locales: ["en", "da", "es"],                 // required, ordered, at least one
  basePath: "https://app.example.com/api/tms", // absolute; required unless endpoints.values is given
  sourceLocale: "en",                          // optional; must be one of the locales
  endpoints: { values, usageReport, usageRead }, // optional overrides; key templates need {key}
  schema: {
    valueField: { type: "textarea" },          // "text" (default) | "textarea"
    fields: [                                  // text | textarea | select | readonly
      { type: "select", name: "status", required: true, options: [{ label: "Draft", value: "draft" }] },
    ],
    toolbar: { search: true, filters: [{ field: "status" }] },
  },
  colors: { highlight: "#4CAF50", active: "#2196F3" },
  scanAttributes: ["data-tooltip"],            // added to aria-label, alt, title, placeholder
});
```

## Options

| Option | Required | Notes |
| --- | --- | --- |
| `locales` | yes | Ordered, at least one. |
| `basePath` | unless `endpoints.values` is given | Absolute URL of the mount point. |
| `sourceLocale` | no | Must be one of `locales`. |
| `endpoints` | no | Overrides for `values`, `usageReport` and `usageRead`. Key templates need `{key}`. |
| `schema.valueField` | no | `"text"` (default) or `"textarea"`. |
| `schema.fields` | no | Extra columns per translation: `text`, `textarea`, `select` or `readonly`. |
| `schema.toolbar` | no | Search and filters for the panel toolbar. |
| `colors` | no | Outline colours for the highlighter. |
| `scanAttributes` | no | Attributes to scan in addition to `aria-label`, `alt`, `title` and `placeholder`. |

## Types follow the configuration

The Locale list keeps its literal type, a Locale's row type is derived from the
Schema (a Select narrows to its option values), and an adapter typed for
another configuration is a compile error.

Reserved Field names (`value`, `locale`, `expected`, `fields`, `revision`) are
rejected at boot.
