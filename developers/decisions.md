# Design decisions

Each repository keeps a `DECISIONS.md` recording the choices made where the
specification was silent, with the reasoning. They are the authoritative
record:

- [core/DECISIONS.md](https://github.com/intl-tms/core/blob/main/DECISIONS.md)
- [extension/DECISIONS.md](https://github.com/intl-tms/extension/blob/main/DECISIONS.md)

The ones most worth knowing before you integrate are summarised here.

## Core

### Markers are invisible characters appended to each string

The frame is `START · version · key bytes · check byte · END`, using U+2063 and
U+2064 as sentinels and the variation selectors U+FE00 to U+FE0F as payload.
These were chosen because they are default-ignorable, single UTF-16 code units,
not whitespace, not joining or bidi controls, and survive JSON, URI, UTF-8,
Unicode normalisation and HTML round trips. Zero-width spaces and joiners were
rejected because they change line breaking or shaping.

A CRC-8 over the version and key bytes means a damaged marker is rejected
rather than decoded to a wrong key.

### The Toggle is a cookie, and it is not security

The Toggle cookie is `tms-edit` with value `1`. It only asks the website to
mark its Catalog. Authorization is a separate, required function with no
default.

### Storage and authorization have no defaults

The Core defines the adapter contract and ships a conformance suite, but no
production adapter. The memory adapter exists for tests.

### Writes are protected against cross-site requests

Writes must be `application/json`, and a write with a foreign `Origin` is
refused before authorization runs. A request with no `Origin` is allowed,
because it comes from a non-browser caller with no ambient cookies.

### Shared keys

A key under the fixed prefix `shared` (case-sensitive) is flagged as possibly
appearing in more than one place.

## Extension

### Chrome only, baseline scope

The Extension implements the baseline of its specification for Chrome. Not
built: discovery, restoring the selection after a reload, drafts across a
closed panel, an options page, commands, a context menu, localisation, and a
second browser family.

### Messages are relayed through the Worker

The Page Host and the Side Panel talk through the Worker rather than over a
direct channel. Every relayed message names its tab, and the panel names that
tab back on every command.

### Access is granted per website

The Extension requests no site access at install. Each website is granted when
an Editor switches edit mode on there.

## Deferred work

Both files end with a **Deferred** section listing what is specified but
deliberately not built yet. Check there before assuming a feature exists.
