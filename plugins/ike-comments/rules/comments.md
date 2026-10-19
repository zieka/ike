# ike-comments: code comment rules

When writing or editing code, comment only what the code and its git/PR history cannot say.

- Skip the comment when the code already explains itself.
- Explain why, not what.
- Prefer inline comments. Use a doc block only for a public API (function, class, module); keep it to 2 lines and capture the intent and assumptions at time of writing.
- Use a standard label where one fits:
  - `TODO:` deferred work or a pending decision
  - `FIXME:` known incorrect or suboptimal; replace later
  - `HACK:` deliberate workaround; name the constraint behind it
  - `REGEX:` the pattern in plain English
  - `NOTE:` context not obvious from the code
  - `WARNING:` behavior likely to cause bugs or misuse
  - `PERF:` a non-obvious performance tradeoff
