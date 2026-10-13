# ʻIke

**ʻIke** — Hawaiian for *knowledge, understanding, to see*.

A Claude Code plugin marketplace for the commands I actually use.

## Install

```
/plugin marketplace add zieka/ike
/plugin install ike@ike
```

## What you get

| | Invoke | For |
|---|---|---|
| command | `/ike:reduce-comments` | pruning comments |
| command | `/ike:reduce-tests` | pruning tests |
| command | `/ike:design-critique` | red-teaming a design |
| command | `/ike:pr-description-template` | writing a PR body |
| skill | `/ike:design-grid` | comparing design variants |
| output style | `/output-style` → `ike:Laconic` | fewest words, plain language |

Each carries its own description — `/help` and the command picker show them.

## design-grid

The only one with moving parts. It renders a two-axis grid of variants into a
single self-contained `.html` file under `~/Documents/design-grids/`.

Requires `python3` and `node`. Node runs the `--check` pass, which evaluates
every cell under a DOM stub before you open anything.

## Laconic

Output style: fewest words that keep the meaning. Leads from knowns to a point,
defines terms, favors symbols (→ ⇒ ≈), nested lists, and tables for comparisons.
Keeps Claude Code's coding instructions.

Pick it in `/output-style`, or set `"outputStyle": "ike:Laconic"` in
`settings.json`. The name is case-sensitive; `ike:laconic` silently does nothing.

## Contributing

`python3 scripts/validate.py` before you push. CI runs it on every PR.

## License

MIT
