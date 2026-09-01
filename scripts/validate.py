#!/usr/bin/env python3
"""Structural checks for this plugin. No dependencies, no network, no auth.

`claude plugin validate` checks manifest shape only. It passed on 7fe5e26 while
a command and a skill both resolved to `ike:design-grid`, which silently made the
skill unreachable. Everything here covers what that misses.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors: list[str] = []


def err(where: str, msg: str) -> None:
    errors.append(f"{where}: {msg}")


def frontmatter(path: pathlib.Path) -> dict[str, str]:
    text = path.read_text()
    if not text.startswith("---"):
        return {}
    block = text.split("---", 2)[1]
    return dict(re.findall(r"^([A-Za-z-]+):\s*(.*)$", block, re.M))


commands = sorted(ROOT.glob("commands/*.md"))
skills = sorted(ROOT.glob("skills/*/SKILL.md"))

# 1. Manifests parse and carry what the marketplace schema requires.
for rel, required in [
    (".claude-plugin/plugin.json", ["name"]),
    (".claude-plugin/marketplace.json", ["name", "owner", "plugins"]),
]:
    path = ROOT / rel
    if not path.is_file():
        err(rel, "missing")
        continue
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        err(rel, f"invalid JSON: {exc}")
        continue
    for key in required:
        if key not in data:
            err(rel, f"missing required key {key!r}")
    for i, entry in enumerate(data.get("plugins", [])):
        for key in ("name", "source"):
            if key not in entry:
                err(rel, f"plugins[{i}] missing required key {key!r}")

# 2. A command basename and a skill name must never match.
#    Plugin commands and plugin skills share one namespace and commands win the
#    lookup, so a collision makes the skill unreachable with no warning.
skill_names = {frontmatter(s).get("name") or s.parent.name: s for s in skills}
for cmd in commands:
    if cmd.stem in skill_names:
        err(
            f"commands/{cmd.name}",
            f"name collides with skill {skill_names[cmd.stem].relative_to(ROOT)} — "
            f"both resolve to the same command; the skill would be shadowed",
        )

# 3. Every entry needs a description; it is what the picker shows.
for path in commands + skills:
    desc = frontmatter(path).get("description", "").strip()
    if not desc:
        err(str(path.relative_to(ROOT)), "empty or missing `description:` frontmatter")

# 4. Absolute ~/.claude paths do not exist once installed as a plugin.
for path in commands + skills:
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if "~/.claude/" in line:
            err(f"{path.relative_to(ROOT)}:{n}", "hardcoded ~/.claude path breaks inside a plugin")

# 5. Marketplace entries must not restate plugin.json metadata; the two drift.
try:
    pj = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
    mj = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text())
    for i, entry in enumerate(mj.get("plugins", [])):
        if entry.get("source") != "./":
            continue
        for key in ("version", "author", "homepage", "license"):
            if key in entry and entry[key] == pj.get(key):
                err(
                    ".claude-plugin/marketplace.json",
                    f"plugins[{i}].{key} duplicates plugin.json and will drift — omit it",
                )
except (OSError, json.JSONDecodeError):
    pass  # already reported in check 1

print(f"checked {len(commands)} command(s), {len(skills)} skill(s)")
if errors:
    print(f"\n{len(errors)} problem(s):", file=sys.stderr)
    for e in errors:
        print(f"  {e}", file=sys.stderr)
    sys.exit(1)
print("ok")
