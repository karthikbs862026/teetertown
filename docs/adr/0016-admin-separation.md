# ADR-0016: Admin Laboratory Separation

**Status:** Accepted, 2026-07-26

Fault injection, overlays, teleport/force-result, economy/profile controls, and diagnostic tooling
exist only in development/lab builds. Production mode statically eliminates the devtools import, and
a bundle scan rejects stable lab markers.

There are no credentials or privileged remote admin APIs.
