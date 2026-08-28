# design-grid reference

Kit API, axis recipes, and the mistakes that produce a broken grid.

## Kit API

All helpers return HTML strings. Every one takes the row spec last so it can read
`row.hues`. Sizes are emitted as `calc()` over the variable contract — **never write a literal
px into a renderer**, or that renderer stops responding to a density axis.

### Units

```js
U(n)    // calc(var(--u) * n)   spacing
FS(n)   // calc(var(--fs) * n)  block height
```

### Blocks

```js
bar(w, k, cls, style)   // w px at --wk:1; k = height in --fs multiples; cls: t|d|a|a2
barFlex(k, cls, style)  // same but fills its flex parent
dot(units, color, round)// units of --u; round=false gives a rounded square
grow()                  // <div style="flex:1">
gap(units)              // vertical spacer
hue(row, i)             // i-th categorical hue, falls back to accent/accent2
```

`cls`: `t` = primary text, `d` = dim text, `a` = accent, `a2` = secondary accent.

### Chrome

```js
win(content, {active, navCount, showRail, showTop}, row)  // app window
rail(active, row, count)                                  // left nav alone
topbar()                                                  // top bar alone
browserFrame(content)                                     // URL-bar chrome
phoneFrame(content, widthPct)                             // phone frame
```

`win()` fills `--ch`. Its `.content` is `overflow:hidden` — content past the box is clipped.

### Composites

```js
listRows([{w, sub, hue, badge, trailing}], row)   // hairline list
table([headerWidths], [[cellWidths]], row, {status})  // col 0 left, rest right
kpis(n, row)                                      // stat tiles
form(n, row)                                      // labelled inputs + buttons
nav(items, row)                                   // marketing top nav
diff([[accentW, dimW, "add"|"del"|null]], row)    // code diff
graph(row, {nodes, edges, focus})                 // SVG node graph
chart("bar"|"line"|"area", data, row)             // data is 0..1 values
```

### CSS classes

`.t .d .a .a2` blocks · `.card` surface · `.pill` · `.row` `.col` `.grow` · `.hairline`
· `.btnA .btnB .btnG` primary/secondary/ghost · `.rt` real-type wrapper (`h1 h2 h3 p small`
scale off `--type`).

## Axis recipes

### Themes (vars, rows)

Give each row full colour vars plus `swatches` for the header chips and `hues` for
categorical data. Set `spectrum: true` to colour every nav item instead of just the active one.

### Density (vars, rows)

Only three properties matter:

```js
{ "--u": "3px", "--fs": "5px", "--wk": ".9", "--r": "3px" }   // compact
{ "--u": "6px", "--fs": "9px", "--wk": "1.15", "--r": "8px" } // sparse
```

Add `"--ch": "360px"` to a sparse row if its content clips. Clipping is legitimate signal —
override only when the clipping is the frame's fault, not the density's.

### Type scale (vars, rows — focal/hifi)

```js
{ "--font": "'GT America', system-ui", "--type": "13px", "--lh": "1.5" }
```

Then render real text inside `.rt`. Verify the family resolves first (see SKILL.md).

### Screens / components (renderers, cols)

One `render` per column. Reuse `SAAS.*` where it fits; hand-roll otherwise.

### States (renderers, cols)

Empty / loading / populated / error. Loading = `.card` blocks at low opacity; empty = a
centred icon plus one `bar`; error uses `var(--red)`.

### Both axes content-shaped

`render: (row, col) => build(row.layout, col.state)`. Budget drops — every cell is bespoke.

## Pitfalls

**Literal px in a renderer.** The single most common failure. It renders fine, then the
density axis does nothing and the grid looks broken for no visible reason. Use `U()` / `FS()`
and `calc(Npx * var(--wk))` for widths.

**Forgetting `--check`.** A renderer that throws produces a red error cell in the page. The
check catches it in the terminal instead.

**`import`/`export` in spec.js.** It is injected into a classic `<script>`; build.py rejects
modules outright.

**Overriding `--cw`/`--ch` globally.** They live on `:root`. Pass `--css` with a `:root{}`
block to change the default cell box for a whole grid; put them in a row's `vars` to change
one row.

**Too many hues.** `hue(row, i)` cycles. A 9-hue palette across a 6-row table reads as noise;
that may be the finding, but say so in the `NOTE` rather than letting it look accidental.

**A `NOTE` that only describes.** The note earns its space by saying which variant wins on
which screen and what breaks. "Warm Carbon is friendlier but loses contrast on the diff" is
worth writing; "Warm Carbon is a warm theme" is not.

## Anatomy of the output

```
<head>  inlined @font-face, kit.css, optional --css
<body>  .head  h1#gt + p#gb            <- TITLE, BLURB
        .scroll > .gridwrap#grid       <- corner, colheads, rowhead + cells per row
        .note#note                     <- NOTE
<script> kit.js, presets/*.js, spec.js, mountGrid()
```

`mountGrid()` reads the globals `TITLE BLURB ROWS COLS NOTE`; each is optional. Omitting
`ROWS` produces a single-row strip with no header column.
