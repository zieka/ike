/* ==========================================================================
   design-grid kit.js — low-fi render helpers + grid runtime.

   Every helper takes the row spec as its last argument so it can read
   `row.hues` for per-category colour. Sizes are emitted as calc() over the
   variable contract, never as literal px, so a density or type-scale axis
   changes output without touching a renderer.
   ========================================================================== */

/* ---------- core block ----------------------------------------------------
   bar(width, k, cls, style)
     width  content length in px at --wk:1
     k      height as a multiple of --fs  (default 1)
     cls    t | d | a | a2   (text, dim, accent, accent2)
   -------------------------------------------------------------------------- */
function bar(w, k = 1, cls = "t", style = "") {
  return `<div class="${cls}" style="width:calc(${w}px * var(--wk));height:calc(var(--fs) * ${k});${style}"></div>`;
}

/** A bar that fills its flex parent instead of taking a fixed width. */
function barFlex(k = 1, cls = "t", style = "") {
  return `<div class="${cls}" style="flex:1;height:calc(var(--fs) * ${k});${style}"></div>`;
}

/** Square/round swatch sized in --u units. */
function dot(units = 1.5, color = "var(--accent)", round = true) {
  return `<div style="width:calc(var(--u) * ${units});height:calc(var(--u) * ${units});` +
    `border-radius:${round ? "50%" : "calc(var(--r) - 2px)"};background:${color};flex:none"></div>`;
}

/** Spacer / flexible gap. */
const grow = () => `<div style="flex:1"></div>`;
const gap = (units) => `<div style="height:calc(var(--u) * ${units})"></div>`;

/** Nth categorical hue for a row, falling back to the row's accents. */
function hue(row, i) {
  const h = row && row.hues;
  if (h && h.length) return h[i % h.length];
  return i % 2 ? "var(--accent2)" : "var(--accent)";
}

const U = (n) => `calc(var(--u) * ${n})`;
const FS = (n) => `calc(var(--fs) * ${n})`;

/* ---------- chrome -------------------------------------------------------- */

function rail(active = 0, row = {}, count = 8) {
  let items = "";
  for (let i = 0; i < count; i++) {
    if (row.spectrum) {
      const h = hue(row, i), on = i === active;
      const ring = on ? `;box-shadow:0 0 0 2px var(--bg),0 0 0 3.5px ${h}` : "";
      items += `<div class="ni" style="background:${h};opacity:${on ? 1 : .82}${ring}"></div>`;
    } else {
      items += `<div class="ni${i === active ? " on" : ""}"></div>`;
    }
  }
  return `<div class="side"><div class="logo"></div>${items}</div>`;
}

function topbar() {
  return `<div class="top"><div class="org"></div>${grow()}` +
    `<div class="srch"></div><div class="ic"></div><div class="ic"></div><div class="av"></div></div>`;
}

/** Full app window: left rail + top bar + content. */
function win(content, opts = {}, row = {}) {
  const { active = 0, navCount = 8, showRail = true, showTop = true } = opts;
  return `<div class="win">${showRail ? rail(active, row, navCount) : ""}` +
    `<div class="main">${showTop ? topbar() : ""}<div class="content">${content}</div></div></div>`;
}

/** Browser chrome around a page. */
function browserFrame(content) {
  return `<div class="win plain"><div class="chrome"><div class="dots"><i></i><i></i><i></i></div>` +
    `<div class="url"></div></div><div class="content" style="height:calc(100% - ${U(6)})">${content}</div></div>`;
}

/** Phone frame; content area is the remaining height. */
function phoneFrame(content, widthPct = 52) {
  return `<div style="height:var(--ch);display:flex;align-items:center;justify-content:center">` +
    `<div class="win plain phone" style="width:${widthPct}%;height:96%;display:flex;flex-direction:column">` +
    `<div class="notch"><i></i></div><div class="content grow">${content}</div></div></div>`;
}

/* ---------- composites ---------------------------------------------------- */

/**
 * Hairline-separated list rows.
 * items: [{ w, sub, hue, badge, trailing }]
 */
function listRows(items, row = {}) {
  return items.map((it, i) => {
    const swatch = it.hue === false ? "" :
      `<div style="width:${U(5)};height:${U(5)};border-radius:calc(var(--r) - 1px);` +
      `background:${it.hue || hue(row, i)};opacity:.9;flex:none"></div>`;
    const badge = it.badge ? `<div class="card pill" style="width:calc(${it.badge}px * var(--wk));height:${FS(1.5)}"></div>` : "";
    const sub = it.sub ? `<div class="d" style="width:calc(${it.sub}px * var(--wk));height:${FS(.83)};opacity:.6"></div>` : "";
    return `<div class="row hairline" style="gap:${U(2)};padding:${U(1.75)} 0">
      ${swatch}
      <div class="grow col" style="gap:${U(1)}">
        <div class="row" style="gap:${U(1.5)}">${bar(it.w || 54, 1.33)}${badge}</div>
        ${sub}
      </div>
      ${it.trailing === false ? "" : bar(5, 1.33, "d", "opacity:.5")}
    </div>`;
  }).join("");
}

/**
 * Header row + data rows.
 * headers: [px widths]   rows: [[px widths]]   opts: {status:true} colours col 0
 */
function table(headers, rows, row = {}, opts = {}) {
  // Column 0 sits left; everything after it is pushed right by a single grow().
  const cells = (widths, lead) =>
    widths.map((w, i) => (i === 1 ? grow() : "") + (i === 0 ? lead(w) : bar(w, 1, "d", "opacity:.7"))).join("");

  const head = headers.length
    ? `<div class="row" style="gap:${U(2)};padding-bottom:${U(1.25)}">` +
      cells(headers, (w) => bar(w, 1, "d", "opacity:.7")) + `</div>`
    : "";

  const body = rows.map((widths, i) => {
    const lead = (w) => opts.status
      ? dot(1.5, hue(row, i)) + bar(w, 1.17, "a2", `background:${hue(row, i)};opacity:.9`)
      : bar(w, 1.17);
    return `<div class="row hairline" style="gap:${U(2)};padding:${U(1.25)} 0">` +
      cells(widths, lead) + `</div>`;
  }).join("");

  return head + body;
}

/** Stat tiles across the top of a screen. */
function kpis(n = 4, row = {}) {
  const tiles = Array.from({ length: n }, (_, i) =>
    `<div class="card grow col" style="gap:${U(1.5)};padding:${U(2)}">
       ${bar(34, .83, "d", "opacity:.65")}
       ${bar(46, 2, "t", i === 0 ? "" : "")}
       <div class="row" style="gap:${U(1)}">${dot(1.25, hue(row, i))}${bar(26, .83, "d", "opacity:.55")}</div>
     </div>`).join("");
  return `<div class="row" style="gap:${U(2)};align-items:stretch">${tiles}</div>`;
}

/** Labelled input rows. */
function form(n = 4, row = {}) {
  const fields = Array.from({ length: n }, (_, i) =>
    `<div class="col" style="gap:${U(1.25)}">
       ${bar(38 + (i * 11) % 30, .83, "d", "opacity:.7")}
       <div class="card" style="height:${FS(2.6)}"></div>
     </div>`).join("");
  return `<div class="col" style="gap:${U(2.25)}">${fields}
    <div class="row" style="gap:${U(1.5)};padding-top:${U(1)}">
      <div class="btnA" style="width:${U(16)};height:${FS(3)}"></div>
      <div class="btnG" style="width:${U(12)};height:${FS(3)}"></div>
    </div></div>`;
}

/** Horizontal top nav, for marketing / web cells. */
function nav(items = 5, row = {}) {
  const links = Array.from({ length: items }, (_, i) => bar(30 + (i * 9) % 22, 1, "d", "opacity:.75")).join("");
  return `<div class="row hairline" style="gap:${U(2.5)};padding:${U(2)} 0;border-top:none">
    ${dot(3, "var(--text)", false)}${bar(52, 1.33)}${grow()}${links}
    <div class="btnA" style="width:${U(14)};height:${FS(2.6)}"></div></div>`;
}

/**
 * Code diff rows. lines: [[accentW, dimW, "add"|"del"|null]]
 */
function diff(lines, row = {}) {
  return `<div class="col" style="gap:1px">` + lines.map((c) => {
    const cls = c[2] ? " " + c[2] : "";
    const sgn = c[2] ? `<div class="sgn"></div>` : `<div style="width:var(--u);flex:none"></div>`;
    return `<div class="cl${cls}"><div class="ln"></div><div class="ln"></div>${sgn}` +
      bar(c[0], .83, "a2", "opacity:.85") + bar(c[1], .83, "d", "opacity:.7") + `</div>`;
  }).join("") + `</div>`;
}

/** Node graph. Deterministic layout; hues come from the row. */
function graph(row = {}, opts = {}) {
  const nodes = opts.nodes || [[100, 46], [74, 66], [126, 58], [150, 52], [60, 92], [46, 118],
    [100, 116], [150, 96], [164, 128], [86, 150], [128, 168], [62, 158], [110, 190]];
  const edges = opts.edges || [[6, 0], [0, 1], [0, 2], [2, 3], [6, 4], [4, 5], [6, 7], [7, 8],
    [6, 9], [9, 10], [9, 11], [6, 12], [6, 2]];
  const focus = opts.focus === undefined ? 6 : opts.focus;
  const l = edges.map(([a, b]) =>
    `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" ` +
    `stroke="var(--textdim)" stroke-width="1" opacity=".45"/>`).join("");
  const d = nodes.map((n, i) => i === focus
    ? `<circle cx="${n[0]}" cy="${n[1]}" r="16" fill="none" stroke="var(--accent)" stroke-width="1" opacity=".45"/>` +
      `<circle cx="${n[0]}" cy="${n[1]}" r="9" fill="var(--accent)"/>`
    : `<circle cx="${n[0]}" cy="${n[1]}" r="4.5" fill="${hue(row, i)}" opacity=".9"/>`).join("");
  return `<svg viewBox="0 0 210 210" preserveAspectRatio="xMidYMid meet">${l}${d}</svg>`;
}

/**
 * chart(kind, data, row) — kind: "bar" | "line" | "area" | "spark"
 * data: array of 0..1 values. Falls back to a fixed pleasant series.
 */
function chart(kind = "bar", data, row = {}) {
  const v = data && data.length ? data : [.35, .58, .42, .71, .5, .84, .62, .93, .74, .55, .68, .88];
  const W = 200, H = 90, n = v.length;
  if (kind === "bar") {
    const bw = W / n * .62, step = W / n;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">` + v.map((y, i) =>
      `<rect x="${(i * step + (step - bw) / 2).toFixed(1)}" y="${(H - y * H).toFixed(1)}" ` +
      `width="${bw.toFixed(1)}" height="${(y * H).toFixed(1)}" rx="1.5" fill="${hue(row, i)}" opacity=".9"/>`
    ).join("") + `</svg>`;
  }
  const pts = v.map((y, i) => `${(i / (n - 1) * W).toFixed(1)},${(H - y * H).toFixed(1)}`).join(" ");
  const line = `<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>`;
  const fill = kind === "area"
    ? `<polygon points="0,${H} ${pts} ${W},${H}" fill="var(--accent)" opacity=".14"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${fill}${line}</svg>`;
}

/* ---------- grid runtime -------------------------------------------------- */

function renderGrid(cfg) {
  const cols = cfg.cols || [];
  const strip = !cfg.rows || !cfg.rows.length;
  const rows = strip ? [{ vars: {} }] : cfg.rows;

  document.title = cfg.title || "design grid";
  const h1 = document.getElementById("gt");
  const bl = document.getElementById("gb");
  if (h1) h1.textContent = cfg.title || "";
  if (bl) bl.innerHTML = cfg.blurb || "";

  const grid = document.getElementById("grid");
  grid.style.gridTemplateColumns =
    (strip ? "" : "var(--headw) ") + `repeat(${cols.length}, var(--cw))`;
  grid.style.minWidth =
    `calc(${strip ? 0 : 1} * (var(--headw) + var(--gap)) + ${cols.length} * (var(--cw) + var(--gap)))`;

  let html = strip ? "" : `<div></div>`;
  for (const c of cols) {
    html += `<div class="colhead">${c.label || ""}` +
      (c.desc ? `<span class="cd">${c.desc}</span>` : "") + `</div>`;
  }

  for (const r of rows) {
    if (!strip) {
      const sw = (r.swatches || []).map((c) => `<span style="background:${c}"></span>`).join("");
      html += `<div class="rowhead"><div class="rn">${r.name || ""}</div>` +
        (r.desc ? `<div class="rd">${r.desc}</div>` : "") +
        (sw ? `<div class="sw">${sw}</div>` : "") + `</div>`;
    }
    const vars = Object.entries(r.vars || {}).map(([k, v]) => `${k}:${v}`).join(";");
    for (const c of cols) {
      let body;
      try {
        body = c.render(r, c);
      } catch (e) {
        body = `<div class="win"><div class="content" style="color:#f26d6d;font:12px/1.4 ui-monospace,monospace">` +
          `render error: ${String(e && e.message || e)}</div></div>`;
        if (typeof console !== "undefined") console.error("cell render failed", r.name, c.label, e);
      }
      html += `<div class="cell" style="${vars}">${body}</div>`;
    }
  }
  grid.innerHTML = html;

  const note = document.getElementById("note");
  if (note) note.innerHTML = cfg.note || "";
}

/** Called by the template once every script has evaluated. */
function mountGrid() {
  renderGrid({
    title: typeof TITLE !== "undefined" ? TITLE : "design grid",
    blurb: typeof BLURB !== "undefined" ? BLURB : "",
    rows: typeof ROWS !== "undefined" ? ROWS : null,
    cols: typeof COLS !== "undefined" ? COLS : [],
    note: typeof NOTE !== "undefined" ? NOTE : "",
  });
}
