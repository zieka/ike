---
name: design-grid
description: Build a two-axis grid of design variants as a standalone .html file
argument-hint: "[rows axis] × [cols axis]"
---

The user wants a two-axis design exploration grid.

Invoke the `ike:design-grid` skill via the `Skill` tool and follow its workflow exactly —
including the confirm step before generating.

$ARGUMENTS describes the axes, e.g. "6 dark themes × our 5 main screens" or "information
density low to high × catalog, activity, results".

If $ARGUMENTS names only one axis, propose a complementary second one at the confirm step.
If it is empty, ask what design space they want to explore.
