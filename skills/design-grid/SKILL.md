---
name: design-grid
description: Build a two-axis grid of design variants as a standalone .html file — themes × screens, density × layout, fonts × components. Use to compare design options side by side or explore a design space.
argument-hint: "[rows axis] × [cols axis]"
---

# Design Grid

Turns a one-line prompt into a grid of design variants in one self-contained `.html` file.
Two axes, low-fidelity by default, built for judging a design space fast.

**Output:** `~/Documents/design-grids/YYYY-MM-DD-<rows>-x-<cols>.html`. File only — no publishing.

## Workflow

### 1. Parse the axes

Classify each axis as one of three forms. They mix freely.

| Form | Input | You derive |
|---|---|---|
| Enumerated | "Mint, Warm Carbon, Cyan" | use as given |
| Gradient | "density low to high" | N ordered steps, monotonic |
| Category | "different nav patterns" | N plausible distinct options |

**Gradient axes name their mechanism.** A header reads `Dense — 4px unit, 6px blocks, no
descriptions`, not `Dense`. A gradient you cannot read the mechanism off is a blur.

**Only one axis given?** Propose a complementary second one. If declined, build a single-row
strip (omit `ROWS` entirely — the runtime drops the header column).

**No axes given?** Ask what design space to explore. Do not guess.

### 2. Pick a fidelity mode

| Mode | Cell contains | Use when |
|---|---|---|
| `lofi` | Blocks throughout | Page-level: layout, IA, density, theme/colour across whole screens |
| `focal` | Element under test real, context stays blocks | Axis varies something legibility-dependent but context matters |
| `hifi` | Fully real content | Subject is one small element — banner, button, card, hero, nav, lockup |

Two questions, in order:
1. **Does the axis change something only judgeable by reading it?** Typeface, type scale,
   weight, copy, icon set, label length → real. Proportion, rhythm, hierarchy, colour
   behaviour → blocks preserve all of it, stay `lofi`.
2. **How much of the cell does the subject fill?** A banner fills 384×300 and can afford real
   rendering. A full app screen cannot.

### 3. Confirm — then stop

Print this and wait. Correcting a derived axis here is free; regenerating is not.

```
ROWS — themes (enumerated, 6)   COLS — density (gradient, 4)
1. Mint Genome                  A. Sparse       6px unit, 9px blocks
2. Warm Carbon                  B. Comfortable  5px unit, 7px blocks
3. Cyan Sequence                C. Dense        4px unit, 6px blocks
…                               D. Compact      3px unit, 5px blocks

Fidelity: lofi — page-level subject, blocks preserve what's being judged
→ 24 cells. Go?
```

### 4. Author `spec.js`

Write it to the scratchpad. This is the only per-run file; everything else is inlined by
`build.py`. Read `reference.md` for the kit API before writing renderers.

```js
const TITLE = "Theme × screen — low-fi app mocks";
const BLURB = "One paragraph: what this grid tests and what to watch for.";

const ROWS = [
  { name: "Mint Genome",
    desc: "Cool neutral greys, single mint accent.",
    swatches: ["#0a0a0b", "#7cf6a0", "#7dd3fc"],   // optional chips in the row header
    hues: ["#e879f9", "#38bdf8", "#7cf6a0"],       // optional categorical palette
    spectrum: false,                                // true = colour every nav item
    vars: { "--bg": "#0a0a0b", "--accent": "#7cf6a0", "--r": "5px" } },
];

const COLS = [
  { label: "Catalog", desc: "optional sub-label", render: SAAS.catalog },
];

const NOTE = `<p><b>What to compare.</b> …</p>`;
```

`render(row, col)` receives both axis specs, so a grid with two content-shaped axes needs no
separate code path.

### 5. Build

```bash
python3 ${CLAUDE_SKILL_DIR}/build.py <spec.js> \
  -o ~/Documents/design-grids/YYYY-MM-DD-<rows>-x-<cols>.html --check
```

**Always pass `--check`.** It evaluates the bundle under a DOM stub in node and fails on any
cell that throws, before the user opens anything.

Flags: `--font 'Family[:weight[:style]]=/path.woff2'` (repeatable, base64-inlines it),
`--css <file>` (extra CSS for hifi cells).

### 6. Report

Print the absolute path and `open <path>`. Nothing else.

### 7. Iterate

"Swap row 3's palette", "add an error-state column", "drop Amber" → edit `spec.js`, rebuild to
the **same** output path, tell the user to reload the tab.

## The variable contract

This is what makes any axis cheap. **No kit primitive hardcodes a size, space, or radius** —
each derives from a custom property, so a row supplying vars restyles every renderer.

| | | |
|---|---|---|
| `--bg` `--surface` `--hair` | `--text` `--textdim` | `--accent` `--accent2` `--red` |
| `--addbg` `--delbg` | `--r` radius | `--u` spacing unit (4px) |
| `--fs` text-block height (6px) | `--wk` block width scale (1) | `--gutter` content padding |
| `--type` `--lh` `--font` real type | `--cw` `--ch` cell box | |

Consequence: `{"--u":"3px","--fs":"5px","--wk":".9"}` yields a genuinely denser cell from the
*same* renderer. Density, type scale and roundness are free axes, exactly like colour.

**Rows may override `--ch`** to give a roomier density more vertical space. Without it,
content past the cell height is clipped — which is itself a useful signal that the density
does not fit.

### The variable-axis rule

When one axis is expressible purely as custom-property values, put it on **ROWS** and the
renderer axis on **COLS**. 8 themes × 5 screens then costs 5 renderers, not 40 cells of
bespoke markup. When both axes are content-shaped, `cell(row, col)` dispatches on both and the
budget drops.

## Fonts

`hifi` and `focal` mean real fonts. The output makes no external requests, but it is a local
file in a local browser — **any installed font works by family name**, no embedding.

Before generating a type comparison, verify each family resolves:

```bash
ls ~/Library/Fonts /Library/Fonts /System/Library/Fonts | grep -i <family>
```

For a family that does not resolve, fetch its woff2 and pass `--font`. If neither path works,
say so and pick a named substitute.

**Never silently fall back.** A grid rendering four "different" typefaces in the same system
fallback is worse than no grid. Report which families were installed, embedded, or substituted.

## Budgets

| Mode | Comfortable | Ceiling |
|---|---|---|
| `lofi` | 48 | 64 |
| `focal` | 30 | 40 |
| `hifi` | 16 | 24 |

Over the ceiling: cut the weaker axis, build, and say what was cut and why. Never silently
truncate an axis.

## Files

- `build.py` — spec + kit + template → standalone html. `--check` catches broken specs.
- `kit.css` — page shell + cell primitives, all custom-property driven
- `kit.js` — render helpers and the grid runtime
- `presets/saas-app.js` — `SAAS.{catalog,activity,builder,chat,results}`, or
  `SAAS_SCREENS` as a ready `COLS`
- `reference.md` — full kit API, axis recipes, pitfalls. Read before writing renderers.
