---
name: as-mindmap
description: Map one feature as a mind map where every node is a question or an answer — a standalone .html to share (e.g. in Slack) plus its .md source. Use to explain what a feature is, how it is used, and what its design settled, to someone who was not there.
argument-hint: "<feature>"
---

# As Mindmap

Explains one feature to a reader who missed its design: what it is, how to use it, and what
the design settled. Every node is a question or an answer to one.

**Output:** `~/Documents/mindmaps/YYYY-MM-DD-<slug>.md` and the `.html` beside it. The `.html`
is one file with no network requests; it opens from disk and carries a button to download the
`.md`. File only — no publishing.

## The rules

`build.py` enforces these and fails with line numbers.

- A node ending in `?` is a question. Every other node is an answer.
- The root is a question.
- A question's children are answers or sub-questions.
- An answer's children are follow-up questions only. Never answer → answer.

Several answers to one question are siblings: `Succeeded…`, `Canceled…`, `Failed…` under
"How is the outcome decided?".

## Workflow

### 1. Find the feature

The argument names it: a command, flag, module, endpoint, or PR. Find its entry point and tests.
Ambiguous or not found → ask. Do not guess.

### 2. Gather

The "why" rarely lives in the code. Read until the questions run out:

- **Code:** entry point, options, defaults, error messages, `--help` text.
- **Tests:** edge cases often live only here.
- **Docs:** `README`, `docs/`, design specs.
- **History:** `git log -- <paths>`, then the PRs that added or changed it:
  `gh pr view <n> --comments`. Review threads hold rejected options and tradeoffs.
- **This conversation**, if it ran during the design.

### 3. Write the map

Write the `.md`: the root as a `#` heading, then a nested `-` list, one node per line, two
spaces per level.

```markdown
# How do I use `git worktree add`?
- What does it do?
  - Checks out a branch into a second directory that shares this repository's history.
    - Why not clone again?
      - A clone copies every object. A worktree shares them, so it is fast and small.
- What if the branch is checked out in another worktree?
  - It refuses, unless you pass `--force`.
    - Why does it refuse?
      - A commit in one worktree would leave the other's checkout out of date.
- What does a typical run look like?
  - `git worktree add ../hotfix -b hotfix main`
```

Content:

- **Root:** the reader's question ("How do I use X?"), not just the name.
- **Top level:** 8–12 questions. Cover what it does, what must exist first, options, what it
  sets up, failure, when to use something else, and a typical run.
- **Questions** in the reader's voice: "What if…?", "Do I need…?", "Will my edits survive?"
- **Design reasoning** as questions: "Why is it a link?", "Why turn it off?", "Should it run
  X?" → "No. …"
- **Answers:** short, plain, exact. Yes/no answers start with "Yes." or "No."
- **Code style:** commands, flags, paths, placeholders, and error text go in backticks,
  verbatim. Backticks also keep `<placeholders>` from reading as HTML in markdown tools.
- **Last branch:** "What does a typical run look like?", one answer per real invocation.
- **Depth:** 5 levels max. Deeper → promote the branch to top level.
- **Sources:** no citations in nodes. A claim not confirmed in code, docs, or history ends in
  "(unverified)". Never state a guess as an answer.

### 4. Build

```bash
python3 ${CLAUDE_SKILL_DIR}/build.py ~/Documents/mindmaps/YYYY-MM-DD-<slug>.md
```

A rule break fails with the line number → fix the `.md`, rebuild. An unanswered question only
warns; answer it or cut it.

### 5. Report

Print both absolute paths and `open <html>`. Nothing else.

### 6. Iterate

Edit the `.md`, rebuild to the same path, tell the user to reload the tab.

## Files

- `build.py` — `.md` → checked tree → standalone `.html`. Needs `python3` only.
- `template.html` — styles and renderer; `build.py` inlines the tree and the `.md`.
