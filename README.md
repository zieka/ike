# ʻIke

**ʻIke** — Hawaiian for *knowledge, understanding, to see*.

A Claude Code plugin marketplace. One place for commands that would otherwise
live loose and unversioned in `~/.claude/commands/`.

## Install

```
/plugin marketplace add zieka/ike
/plugin install ike@ike
```

## Commands

| Command | What it does |
|---|---|
| `/ike:reduce-comments` | Cut new code comments to what earns its place — why over what, inline over doc blocks, standard labels (`TODO:`, `HACK:`, `PERF:`, …) |
| `/ike:reduce-tests` | Prune tests TDD left behind. One governing question: if this test is deleted, what specific bug reaches production, and what does it cost? |
| `/ike:design-critique` | Adversarial design critique in the style of Connor & Irizarry's *Discussing Design* |
| `/ike:design-grid` | Build a two-axis grid of design variants as one standalone `.html` file |
| `/ike:pr-description-template` | PR description structure: Problem, Objectives, and collapsed Assumptions / Changes / Notes |

## Skills

| Skill | Used by |
|---|---|
| `ike:design-grid` | `/ike:design-grid`. Renders the grid — `build.py` inlines the template, CSS, JS kit, and presets into a single self-contained file. |

### design-grid

Two axes, low-fidelity by default, built to judge a design space fast. Axes may
be enumerated (`Mint, Warm Carbon, Cyan`), a gradient (`density low to high`),
or a category (`different nav patterns`), and they mix freely.

Output lands in `~/Documents/design-grids/`. Requires `python3` and `node`
(the `--check` flag evaluates every cell under a DOM stub before you open
anything).

`presets/saas-app.js` ships five generic product screens — catalog, activity,
builder, chat, results — usable as a ready-made column axis via `SAAS_SCREENS`,
or cherry-picked through `SAAS.*`.

## License

MIT
