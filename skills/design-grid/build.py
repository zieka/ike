#!/usr/bin/env python3
"""Build a standalone design-grid HTML file from a spec.js.

    build.py spec.js -o out.html [--font 'Family[:weight[:style]]=/path/to.woff2'] [--check]

Inlines template.html, kit.css, kit.js and every file in presets/ into a single
self-contained page. --check evaluates the bundled JS under a DOM stub in node
and fails the build if any cell throws.
"""

import argparse
import base64
import json
import pathlib
import re
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent


def read(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def guard(js: str) -> str:
    """Keep a literal </script> inside injected JS from closing the tag."""
    return js.replace("</script", "<\\/script")


def font_faces(specs):
    """Turn --font arguments into base64 @font-face rules."""
    rules = []
    for raw in specs:
        if "=" not in raw:
            sys.exit(f"--font needs FAMILY[:weight[:style]]=PATH, got: {raw!r}")
        head, path = raw.split("=", 1)
        parts = head.split(":")
        family = parts[0].strip()
        weight = parts[1] if len(parts) > 1 else "400"
        style = parts[2] if len(parts) > 2 else "normal"

        f = pathlib.Path(path).expanduser()
        if not f.is_file():
            sys.exit(f"font file not found: {f}")
        fmt = {".woff2": "woff2", ".woff": "woff", ".ttf": "truetype", ".otf": "opentype"}.get(
            f.suffix.lower())
        if not fmt:
            sys.exit(f"unsupported font format: {f.suffix} ({f})")

        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        rules.append(
            f'@font-face{{font-family:"{family}";font-weight:{weight};font-style:{style};'
            f'font-display:block;src:url(data:font/{fmt};base64,{b64}) format("{fmt}");}}'
        )
    return "\n".join(rules)


def load_presets() -> str:
    d = HERE / "presets"
    if not d.is_dir():
        return ""
    return "\n".join(read(p) for p in sorted(d.glob("*.js")))


def extract_title(spec_src: str) -> str:
    m = re.search(r'\bTITLE\s*=\s*(["\'])(.*?)\1', spec_src, re.S)
    return m.group(2) if m else "design grid"


CHECK_HARNESS = r"""
const nodes = {};
function stub(id) {
  return nodes[id] || (nodes[id] = { id, style: {}, innerHTML: "", textContent: "" });
}
globalThis.document = { title: "", getElementById: stub };
const errs = [];
globalThis.console = { ...console, error: (...a) => errs.push(a.map(String).join(" ")) };
__BUNDLE__
const grid = nodes.grid ? nodes.grid.innerHTML : "";
const out = { cells: (grid.match(/class="cell"/g) || []).length, errors: errs,
              renderErrors: (grid.match(/render error:/g) || []).length, empty: grid.length < 50 };
process.stdout.write(JSON.stringify(out));
"""


def run_check(bundle: str) -> None:
    with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False, encoding="utf-8") as fh:
        fh.write(CHECK_HARNESS.replace("__BUNDLE__", bundle))
        tmp = fh.name
    try:
        proc = subprocess.run([_node(), tmp], capture_output=True, text=True, timeout=60)
    except FileNotFoundError:
        print("check: node not found, skipping", file=sys.stderr)
        return
    finally:
        pathlib.Path(tmp).unlink(missing_ok=True)

    if proc.returncode != 0:
        sys.exit("check FAILED — the spec throws:\n" + (proc.stderr.strip() or proc.stdout.strip()))

    try:
        res = json.loads(proc.stdout)
    except json.JSONDecodeError:
        sys.exit("check FAILED — harness produced no result:\n" + proc.stdout + proc.stderr)

    if res["empty"] or res["cells"] == 0:
        sys.exit("check FAILED — grid rendered no cells. Is COLS empty?")
    if res["renderErrors"]:
        sys.exit(f"check FAILED — {res['renderErrors']} cell(s) threw:\n  " +
                 "\n  ".join(res["errors"]))
    print(f"check ok — {res['cells']} cells rendered")


def _node() -> str:
    return "node"


def main() -> None:
    ap = argparse.ArgumentParser(description="Build a standalone design-grid HTML file.")
    ap.add_argument("spec", help="path to spec.js")
    ap.add_argument("-o", "--out", required=True, help="output .html path")
    ap.add_argument("--font", action="append", default=[],
                    metavar="FAMILY[:weight[:style]]=PATH",
                    help="inline a font file as a base64 @font-face (repeatable)")
    ap.add_argument("--css", default=None, help="optional extra CSS file to inline")
    ap.add_argument("--check", action="store_true",
                    help="evaluate the bundle in node under a DOM stub before writing")
    args = ap.parse_args()

    spec_path = pathlib.Path(args.spec).expanduser()
    if not spec_path.is_file():
        sys.exit(f"spec not found: {spec_path}")
    spec_src = read(spec_path)
    if re.search(r"^\s*(import|export)\s", spec_src, re.M):
        sys.exit("spec.js must be plain browser JS — no import/export.")

    kit_js = read(HERE / "kit.js")
    presets = load_presets()

    if args.check:
        run_check("\n".join([kit_js, presets, spec_src, "mountGrid();"]))

    html = (read(HERE / "template.html")
            .replace("__TITLE__", extract_title(spec_src))
            .replace("__FONTFACE__", font_faces(args.font))
            .replace("__KIT_CSS__", read(HERE / "kit.css"))
            .replace("__EXTRA_CSS__", read(pathlib.Path(args.css).expanduser()) if args.css else "")
            .replace("__KIT_JS__", guard(kit_js))
            .replace("__PRESETS__", guard(presets))
            .replace("__SPEC_JS__", guard(spec_src)))

    out = pathlib.Path(args.out).expanduser()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"{out}  ({len(html) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
