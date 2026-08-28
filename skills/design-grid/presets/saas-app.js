/* ==========================================================================
   preset: saas-app — five product screens, written against the variable
   contract so they respond to density, radius and type-scale axes as well as
   colour. Use directly:  const COLS = SAAS_SCREENS;
   ...or cherry-pick:     SAAS.builder(row)
   ========================================================================== */

/* ---------- Catalog ---------- */
function saasCatalog(row) {
  const items = [
    { w: 54, sub: 130, badge: 26 }, { w: 40 }, { w: 46, sub: 130, badge: 26 },
    { w: 26 }, { w: 44, sub: 130, badge: 26 }, { w: 38 },
  ];
  const head = `<div class="row" style="gap:${U(1.5)};margin-bottom:${U(1.5)}">
    ${bar(110, 2)}
    <div class="card pill" style="width:calc(78px * var(--wk));height:${FS(2.2)}"></div>
    ${grow()}
    <div class="card" style="width:calc(56px * var(--wk));height:${FS(2.7)};border-radius:calc(var(--r) + 1px)"></div>
  </div>`;
  return win(head + listRows(items, row), { active: 2 }, row);
}

/* ---------- Activity ----------
   Status pills are the point of this screen: 1 = finished (accent),
   2 = completed (accent2), 0 = canceled (neutral card). A theme that cannot
   hold three distinguishable states here will not hold in the product.      */
function saasActivity(row) {
  const stat = [1, 0, 1, 1, 2, 1, 0, 0];
  const rows = stat.map((s, i) => {
    const pill = s === 0
      ? `<div class="card pill" style="width:calc(34px * var(--wk));height:${FS(1.85)}"></div>`
      : `<div class="pill" style="width:calc(40px * var(--wk));height:${FS(1.85)};` +
        `background:${s === 2 ? "var(--accent2)" : "var(--accent)"};opacity:.85;flex:none"></div>`;
    const c = row.spectrum ? hue(row, i) : "var(--accent2)";
    return `<div class="row hairline" style="gap:${U(2)};padding:${U(1.25)} 0">
      ${dot(1.5, c)}
      ${bar(90 + (i * 13) % 70, 1.17, "a2", `background:${c};opacity:.9`)}
      ${grow()}
      ${bar(34, 1, "d", "opacity:.7")}
      ${pill}
      ${dot(2.75, hue(row, i))}
      ${bar(36, 1, "d", "opacity:.6")}
    </div>`;
  }).join("");

  const header = `<div class="row" style="gap:${U(2)};padding-bottom:${U(1.25)}">
    ${dot(1.5, "var(--accent)")}${bar(40, 1, "d", "opacity:.7")}${grow()}
    ${bar(30, 1, "d", "opacity:.7")}${bar(36, 1, "d", "opacity:.7")}
    ${bar(24, 1, "d", "opacity:.7")}${bar(36, 1, "d", "opacity:.7")}</div>`;

  return win(`
    ${bar(70, 2, "t", `margin-bottom:${U(1)}`)}
    ${bar(180, .83, "d", `opacity:.6;margin-bottom:${U(2)}`)}
    ${header}${rows}
    <div class="row" style="gap:${U(2.5)};justify-content:center;padding-top:${U(1.75)}">
      ${bar(40, .83, "d", "opacity:.6")}${bar(44, .83, "a2", "opacity:.9")}
    </div>`, { active: 4 }, row);
}

/* ---------- Builder ---------- */
function saasBuilder(row) {
  const items = [[0, 1], [1, 1], [1, 0], [2, 0], [2, 0], [2, 0], [1, 0], [1, 1]];
  const tree = items.map((it, i) =>
    `<div class="row" style="gap:${U(1.25)};padding:${U(.75)} 0;padding-left:calc(var(--u) * ${it[0] * 2.75});` +
    (i === 0 ? "background:var(--addbg);border-radius:calc(var(--r) - 2px)" : "") + `">
      ${it[1] ? bar(5, .83, "d", "opacity:.6") : `<div style="width:${U(1.25)};flex:none"></div>`}
      ${dot(2.25, i === 0 ? "var(--accent2)" : hue(row, i), false)}
      ${bar(70 - it[0] * 8, .83, i === 0 ? "a2" : "t", "opacity:.9")}
    </div>`).join("");

  const tools = Array.from({ length: 6 }, () =>
    `<div class="d" style="width:${U(3)};height:${U(3)};border-radius:calc(var(--r) - 2px);opacity:.55"></div>`).join("");

  return win(`
    <div class="card row" style="width:calc(120px * var(--wk));height:${FS(3)};margin-bottom:${U(1.75)};padding:0 ${U(1.75)};gap:${U(1.5)}">
      ${dot(2.5, "var(--accent2)", false)}${bar(78, .83)}
    </div>
    <div class="row" style="gap:${U(2)};align-items:stretch;height:calc(100% - ${FS(3)} - ${U(1.75)})">
      <div class="card" style="flex:1.35;position:relative;overflow:hidden">
        <div style="position:absolute;left:${U(1.25)};top:${U(2)};display:flex;flex-direction:column;gap:${U(1.5)}">${tools}</div>
        ${graph(row)}
        <div class="row btnB" style="position:absolute;left:50%;top:56%;transform:translateX(-30%);gap:${U(1.25)};padding:${U(.75)} ${U(1.75)}">
          ${bar(52, .83, "t", "background:var(--bg);opacity:.85")}
        </div>
      </div>
      <div class="card col" style="flex:1;padding:${U(1.75)} ${U(2)};gap:${U(1.5)}">
        <div class="row" style="gap:${U(1.25)}">
          ${dot(2, "var(--accent)")}${bar(60, .83, "d", "opacity:.7")}${grow()}
          <div class="btnB" style="width:${U(8.5)};height:${FS(2.3)}"></div>
          <div class="btnG" style="width:${U(6.5)};height:${FS(2.3)}"></div>
        </div>
        <div class="card" style="height:${FS(2.2)}"></div>
        <div class="row" style="gap:${U(1.5)}">
          <div class="a2 pill" style="width:calc(52px * var(--wk));height:${FS(1.85)};opacity:.85"></div>
          <div class="card pill" style="width:calc(52px * var(--wk));height:${FS(1.85)}"></div>
        </div>
        <div class="col" style="gap:1px">${tree}</div>
      </div>
    </div>`, { active: 3 }, row);
}

/* ---------- Chat ---------- */
function saasChat(row) {
  const w = [130, 110, 120, 90, 120];
  const sug = w.map((x, i) =>
    `<div class="${i ? "hairline" : ""}" style="padding:${U(2)} ${U(.5)}">${bar(x, 1.17, "t", "opacity:.9")}</div>`
  ).join("");
  return win(`
    <div class="col" style="align-items:center;padding-top:${U(3)}">
      <svg viewBox="0 0 40 40" style="width:${U(8.5)};height:${U(8.5)};margin-bottom:${U(2)}">
        <rect x="4" y="4" width="14" height="32" rx="2" fill="none" stroke="var(--accent2)" stroke-width="2.4"/>
        <path d="M22 4 h14 v32 h-14 z" fill="none" stroke="var(--accent2)" stroke-width="2.4"/>
        <line x1="22" y1="16" x2="36" y2="16" stroke="var(--accent2)" stroke-width="2.4"/>
        <line x1="22" y1="26" x2="36" y2="26" stroke="var(--accent2)" stroke-width="2.4"/>
      </svg>
      ${bar(150, 1.85, "t", `margin-bottom:${U(3)}`)}
      <div class="card" style="width:88%;padding:${U(2.25)} ${U(2.5)};box-shadow:inset 0 0 0 1.4px var(--accent2);border-radius:calc(var(--r) + 4px)">
        <div class="row" style="gap:${U(1.5)};margin-bottom:${U(2)}">
          ${bar(96, 1.17, "d", "opacity:.65")}${grow()}${dot(3.5, "var(--textdim)")}
        </div>
        <div class="row" style="gap:${U(1.25)}">
          ${dot(2.25, "var(--textdim)")}${bar(150, .83, "d", "opacity:.55")}
        </div>
      </div>
      <div style="width:88%;margin-top:${U(1.5)}">${sug}</div>
    </div>`, { active: 0 }, row);
}

/* ---------- Results ---------- */
function saasResults(row) {
  const tree = [["finos", 1], ["msg-utils", 2], ["spring-bot", 0], ["symphony", 0],
    ["apache", 1], ["maven-doxia", 0], ["awslabs", 1]];
  const left = tree.map((r) => {
    const isRepo = r[1] !== 1;
    const marker = r[1] === 2 ? dot(1.75, "var(--accent)")
      : r[1] === 0 ? dot(1.75, "var(--textdim)")
      : `<div style="width:${U(1.75)};flex:none"></div>`;
    return `<div class="row hairline" style="gap:${U(1.25)};padding:${U(1)} 0;padding-left:${isRepo ? U(2.5) : 0}">
      ${r[1] === 1 ? bar(5, .83, "d", "opacity:.6") : ""}${marker}
      ${bar(isRepo ? 60 : 50, .83, "t", `opacity:${isRepo ? .9 : 1}`)}${grow()}
      ${bar(r[1] === 2 ? 32 : 30, .83, r[1] === 2 ? "a2" : "d", "opacity:.8")}
    </div>`;
  }).join("");

  const lines = [[40, 60], [36, 54], [44, 48], [50, 40, "del"], [50, 40, "add"],
    [30, 64], [38, 50], [42, 44]];

  return win(`
    ${bar(150, 1.67, "t", `margin-bottom:${U(1)}`)}
    <div class="row" style="gap:${U(1.5)};margin-bottom:${U(1.5)}">
      <div class="card pill" style="width:calc(52px * var(--wk));height:${FS(2)}"></div>
      ${bar(120, .83, "d", "opacity:.6")}
    </div>
    <div class="row hairline" style="gap:${U(2.5)};padding:${U(1.25)} 0 ${U(1.75)}">
      ${bar(40, 1, "a2")}${bar(56, 1, "d", "opacity:.6")}${bar(48, 1, "d", "opacity:.6")}
      ${grow()}${dot(2.75, "var(--textdim)")}${dot(2.75, "var(--textdim)")}
    </div>
    <div class="row" style="gap:${U(2)};align-items:flex-start;height:calc(100% - ${FS(1.67)} - ${FS(2)} - ${U(11)})">
      <div class="col grow" style="gap:${U(1.5)}">
        ${bar(56, 1.17)}
        <div class="card" style="height:${U(6.5)};display:grid;grid-template-columns:1fr 1fr;gap:1px;padding:${U(1.25)}">
          ${Array.from({ length: 4 }, (_, i) =>
            `<div class="d" style="height:${FS(.83)};width:${70 - i * 5}%;opacity:.5;border-radius:var(--r)"></div>`).join("")}
        </div>
        <div class="row card" style="height:${U(3.5)};padding:0 ${U(.75)};gap:2px">
          <div class="a pill" style="flex:1;height:${FS(1.5)};opacity:.85"></div>
          <div class="d pill" style="flex:1;height:${FS(1.5)};opacity:.4"></div>
          <div class="d pill" style="flex:1;height:${FS(1.5)};opacity:.4"></div>
        </div>
        <div class="card" style="height:${U(3)}"></div>
        <div class="col">${left}</div>
      </div>
      <div class="card" style="flex:1.15;padding:${U(1.5)};min-width:0">
        <div class="row hairline" style="gap:${U(1.25)};padding-bottom:${U(1.25)};border-top:none">
          ${dot(2, "var(--textdim)", false)}${dot(2, "var(--accent2)", false)}
          ${bar(40, 1)}${grow()}${bar(10, .83, "d", "opacity:.5")}
        </div>
        ${bar(70, 1, "d", `opacity:.6;margin:${U(1.25)} 0`)}
        ${diff(lines, row)}
      </div>
    </div>
    <div class="btnA row" style="position:absolute;left:50%;bottom:${U(1)};transform:translateX(-50%);gap:${U(1.25)};padding:${U(1.25)} ${U(3)}">
      ${bar(74, .83, "t", "background:var(--bg);opacity:.85")}
    </div>`, { active: 4 }, row);
}

/* ---------- exports ---------- */
const SAAS = {
  catalog: saasCatalog,
  activity: saasActivity,
  builder: saasBuilder,
  chat: saasChat,
  results: saasResults,
};

const SAAS_SCREENS = [
  { label: "Catalog", render: saasCatalog },
  { label: "Activity", render: saasActivity },
  { label: "Builder", render: saasBuilder },
  { label: "Chat", render: saasChat },
  { label: "Results", render: saasResults },
];
