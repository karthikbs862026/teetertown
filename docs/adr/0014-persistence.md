# ADR-0014: Versioned Persistence and Recovery

**Status:** Accepted, 2026-07-26

IndexedDB behind a typed adapter stores versioned settings/progression separately from content cache
and diagnostics. Writes occur only at stable simulation boundaries. Migration backs up the prior
record and tests corrupt/partial input. Tiny preferences may use localStorage later.

Cloud save, account identity, and backend conflict resolution are out of scope.
