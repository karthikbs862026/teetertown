# Localization Plan

English is initial, but all player-facing strings use stable keys and parameterized messages.
Critical instructions are not baked into textures. Layouts allow long strings, flexible line
wrapping, plural/number/date formatting, and mirrored bidirectional flow without mirroring physical
drag meaning or level geometry.

Before adding languages: pseudolocalization, +40% long-string pass, missing-key failure, plural and
number tests, RTL layout review, font glyph/size/bundle budget, screenshots at supported viewports,
and translation-context notes for goal, failure, material, hinge, and mastery terms.

Diagnostic/dev-lab labels may remain English in Phase 1 but are explicitly internal.
