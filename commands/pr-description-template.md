---
description: PR description structure: Problem, Objectives, and collapsed Assumptions / Changes / Notes.
---

# PR description structure (use these exact headings and `<details>` wrappers)

## Problem
- Bulleted. State what is broken/risky and why it matters. First bullet frames
  the overall issue (with issue refs); later bullets break down each distinct
  failure mode in concrete terms.

## Objectives
1. Numbered, imperative ("Gate X behind admin"), outcome-focused. These numbers
   are what **Changes** refers back to.

<details>
<summary><b>Assumptions</b></summary>

- Bulleted. The facts, invariants, and design decisions the PR relies on: the
  canonical mechanism used, equivalences assumed, why an existing check is kept,
  constraints that forced the approach. Phrase as things a reviewer should confirm.
</details>

<details>
<summary><b>Changes</b></summary>

- `(N)` Bulleted, each prefixed with the objective number(s). Name the files
  touched and describe what changed, including tests and the cases they cover.
</details>

<details>
<summary><b>Notes</b></summary>

- Bulleted. Intentional design decisions and rationale (especially deliberate
  asymmetries or things that look inconsistent but aren't), behavior/security
  subtleties, verification performed (which suites/checks ran and passed), and
  closing keywords (`Closes #N`).
</details>