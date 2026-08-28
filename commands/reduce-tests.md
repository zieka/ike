---
description: Prune tests TDD left behind — keep only those that name a specific bug they would catch in production.
---

test driven development is a great way to iterate but often it leaves behind tests that were good for building but serve little purpose later.

evaluate if any newly introduced test in the commit(s) are worthy of keeping:

A single governing question does most of the work: **if I delete this test, what specific bug could reach production, and what would it cost?** If you can't name the bug, the test goes. Everything below is elaboration on that.

## Keep

- **Severe, irreversible failure modes.** Money, data loss or corruption, auth and permissions, deletion paths, migrations, anything with legal or safety exposure. Blast radius matters more than complexity.
- **Bugs that would ship silently.** A crash on startup gets caught in five minutes by anyone. A rounding error in a report, a subtly wrong permission check, or a timezone bug in a scheduler can live for months. Prefer tests over failures nothing else would notice.
- **Non-obvious logic.** Branching, edge cases, off-by-one boundaries, parsing, retry/idempotency, ordering, concurrency, state machines. The test is worth keeping when a competent reader can't confirm correctness just by reading the code.
- **Regression tests for bugs that actually happened.** Empirical evidence the code drifts there. These have the best hit rate of any category.
- **Contracts with someone else.** Public API shapes, serialized formats, DB schema, wire protocols, anything a consumer you can't unilaterally fix depends on. Breakage here is silent and expensive to unwind.
- **One end-to-end smoke path.** Boots, handles the primary happy path, exits clean. Usually the highest value-per-line test in the suite.
- **Mutation-sensitive tests.** If you can introduce a plausible defect and the test still passes, it wasn't protecting anything.

## Delete

- **Anything the type system, compiler, or a schema already guarantees.** Duplicated proof at higher cost.
- **Change detectors.** Tests asserting on internal structure, mock call ordering, or private method behavior. They fail on every refactor and never on a real bug — pure negative value.
- **Redundant coverage.** If a higher-level test would fail for the same reason, keep one. Prefer whichever is fastest and localizes the fault well enough to debug.
- **Flaky tests.** Fix or delete, never tolerate. A nondeterministic test trains people to ignore red, which costs you the whole suite's credibility.
- **Blindly re-baselined snapshots.** If the reflex on failure is to regenerate, it's asserting nothing.
- **Tests of framework or third-party behavior**, trivial accessors, and anything written to move a coverage number rather than catch a named failure.
- **Tests for code paths that are dead, deprecated, or slated for removal.**

## Tie-breakers when two tests survive the same failure mode

Keep the one that's faster, more deterministic, and closer to the behavior a user cares about. When those conflict, favor determinism — a slow reliable test is an asset, a fast flaky one isn’t.


## Special notes
- in ui applications we can almost always drop tests that flex a component (these can be great for agent iteration but have no lasting benefit other than more code to process). Instead favor only tests that deal with computational helpers that manipulate raw data.