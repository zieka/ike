---
name: reduce-comments
description: Cut new code comments down to what earns its place — why over what, inline over doc blocks, standard labels.
---

of the new code lets reduce the word count on the code comments.

- if the code is already self explanitory we might not need a comment. In most cases we dont because we can refrence git history and pull request history.

- If a code comment is necessary, prefer an inline comment over a doc block unless you are documenting a public API (function, class, module, etc.).
- Comments should explain **why**, not **what**. The code should already explain what it is doing.
- Use standardized labels when appropriate:
  - `TODO:` Work that is intentionally deferred or requires a future decision.
  - `FIXME:` The current implementation is known to be incorrect or suboptimal and should be replaced when a larger change is made.
  - `HACK:` Acknowledge that the implementation is an intentional workaround or compromise, and ideally explain the constraint that made it necessary.
  - `REGEX:` Describe the regex in plain English, especially if it is non-trivial.
  - `NOTE:` Important context that isn't obvious from the code.
  - `WARNING:` Call out behavior that could easily lead to bugs or misuse.
  - `PERF:` Explain a performance-related tradeoff or optimization that may not be obvious.

- If code requires a doc block try to not exceed 2 lines and most importantly capture the intention at time of authoring so assumptions can be understood/challenged later.