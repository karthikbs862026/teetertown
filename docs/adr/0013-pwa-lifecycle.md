# ADR-0013: PWA First and Lifecycle Boundary

**Status:** Accepted, 2026-07-26

WebGL/PWA is the initial platform. Visibility, orientation, context, safe-area, audio, offline, and
service-worker update events enter platform adapters and explicit app transitions. An update is
activated between sessions, never during physics.

A native wrapper is deferred until the web vertical slice has physical iOS/Android stability
evidence; wrapper APIs remain behind adapters.
