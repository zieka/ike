# ʻIke

**ʻIke** — Hawaiian for *knowledge, understanding, to see*.

A Claude Code plugin marketplace for the commands I actually use.

## Install

```
/plugin marketplace add zieka/ike
/plugin install ike@ike
```

Codex reads the same marketplace:

```
codex plugin marketplace add zieka/ike
codex plugin add ike@ike
```

See [Codex](#codex) for what carries over.

## What you get

| | Invoke | For |
|---|---|---|
| command | `/ike:reduce-comments` | pruning comments |
| command | `/ike:reduce-tests` | pruning tests |
| command | `/ike:design-critique` | red-teaming a design |
| command | `/ike:pr-description-template` | writing a PR body |
| skill | `/ike:design-grid` | comparing design variants |
| skill | `/ike:as-mindmap <feature>` | explaining a feature as a question/answer mind map |
| output style | `/output-style` → `ike:Laconic` | fewest words, plain language |

Each carries its own description — `/help` and the command picker show them.

## design-grid

Renders a two-axis grid of variants into a single self-contained `.html` file
under `~/Documents/design-grids/`.

Requires `python3` and `node`. Node runs the `--check` pass, which evaluates
every cell under a DOM stub before you open anything.

## as-mindmap

Explains one feature to someone who missed its design: what it is, how to use
it, and why it works that way. Every node is a question or an answer to one;
answers branch only into follow-up questions.

Writes `~/Documents/mindmaps/<date>-<slug>.md` and a self-contained `.html`
beside it: no network requests, shareable in Slack, with a button to download
the `.md`. Requires `python3`.

## Laconic

Output style: fewest words that keep the meaning. Leads from knowns to a point,
defines terms, keeps a small fixed vocabulary (borrowed loosely from Simplified
Technical English), favors symbols (→ ⇒ ≈), nested lists, and tables for
comparisons. Keeps Claude Code's coding instructions.

Pick it in `/output-style`, or set `"outputStyle": "ike:Laconic"` in
`settings.json`. The name is case-sensitive; `ike:laconic` silently does nothing.

## ike-comments

Separate, opt-in plugin. A SessionStart hook loads
`plugins/ike-comments/rules/comments.md` into every session, so Claude writes
lean comments the first time instead of needing `/ike:reduce-comments` after.

```
/plugin install ike-comments@ike
```

Costs about 15 lines of context per session, in every project.

## Codex

Codex reads `.claude-plugin/` directly; there is no separate Codex manifest.

| | In Codex |
|---|---|
| skills | ✓ `ike:design-grid`, `ike:as-mindmap` |
| commands | become skills named `ike:source-command-<name>` |
| Laconic | ✗ Codex has no output styles |
| ike-comments | unverified; or paste `plugins/ike-comments/rules/comments.md` into `~/.codex/AGENTS.md` |

## Contributing

`python3 scripts/validate.py` before you push. CI runs it on every PR.

## License

MIT
