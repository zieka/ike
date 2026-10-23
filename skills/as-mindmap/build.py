#!/usr/bin/env python3
"""Build a standalone mind-map HTML file from a question/answer markdown outline.

    build.py map.md [-o map.html]
"""

import argparse
import html
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
# REGEX: 1-6 #'s, a space, the text, then any closing #'s
HEADING = re.compile(r"^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$")
# REGEX: indent, a list marker (-, *, + or "1." / "1)"), a space, the text
BULLET = re.compile(r"^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$")


class Node:
    def __init__(self, text: str, line: int):
        self.text, self.line, self.kids = text, line, []

    @property
    def question(self) -> bool:
        return self.text.endswith("?")

    def size(self) -> int:
        return 1 + sum(k.size() for k in self.kids)

    def tree(self) -> dict:
        return {"t": self.text, "c": [k.tree() for k in self.kids]}


def parse(src: str) -> list[Node]:
    """Headings nest by level; bullets nest by indent under the last heading."""
    roots: list[Node] = []
    stack: list[tuple[int, Node]] = []
    last = None
    for n, raw in enumerate(src.splitlines(), 1):
        line = raw.expandtabs(4)
        if not line.strip():
            continue
        if m := HEADING.match(line):
            depth, text = len(m.group(1)), m.group(2)
        elif m := BULLET.match(line):
            depth, text = 10 + len(m.group(1)), m.group(2)
        elif last:
            last.text += " " + line.strip()  # hard-wrapped node
            continue
        else:
            sys.exit(f"line {n}: text before the first node: {line.strip()!r}")

        node = Node(text.strip(), n)
        while stack and stack[-1][0] >= depth:
            stack.pop()
        (stack[-1][1].kids if stack else roots).append(node)
        stack.append((depth, node))
        last = node
    return roots


def check(roots: list[Node]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if len(roots) != 1:
        lines = ", ".join(str(r.line) for r in roots) or "none"
        errors.append(f"need exactly one root node, found {len(roots)} (lines: {lines})")
    for root in roots:
        if not root.question:
            errors.append(f"line {root.line}: root must be a question (end with '?'): {root.text!r}")

    def walk(node: Node) -> None:
        if not node.text:
            errors.append(f"line {node.line}: empty node")
        if node.question and not node.kids:
            warnings.append(f"line {node.line}: unanswered question: {node.text!r}")
        for kid in node.kids:
            if not node.question and not kid.question:
                errors.append(
                    f"line {kid.line}: answer under answer (line {node.line}); "
                    f"make it a follow-up question or move it up a level: {kid.text!r}")
            walk(kid)

    for root in roots:
        walk(root)
    return errors, warnings


def embed(value) -> str:
    # < keeps node text like </script> or <!-- from ending the data block.
    return json.dumps(value, ensure_ascii=False).replace("<", "\\u003c")


def main() -> None:
    ap = argparse.ArgumentParser(description="Build a standalone mind-map HTML file.")
    ap.add_argument("md", help="question/answer outline (.md)")
    ap.add_argument("-o", "--out", help="output .html (default: beside the .md)")
    args = ap.parse_args()

    md_path = pathlib.Path(args.md).expanduser()
    if not md_path.is_file():
        sys.exit(f"markdown not found: {md_path}")
    src = md_path.read_text(encoding="utf-8")

    roots = parse(src)
    errors, warnings = check(roots)
    for w in warnings:
        print(f"warning: {w}", file=sys.stderr)
    if errors:
        sys.exit(f"{len(errors)} rule break(s) in {md_path}:\n  " + "\n  ".join(errors))

    root = roots[0]
    values = {
        "TITLE": html.escape(root.text.replace("`", "")),
        "TREE": embed(root.tree()),
        "MD": embed(src),
        "FILE": embed(md_path.name),
    }
    template = (HERE / "template.html").read_text(encoding="utf-8")
    # Single pass, so a placeholder name inside node text is never substituted.
    page = re.sub(r"__(TITLE|TREE|MD|FILE)__", lambda m: values[m.group(1)], template)

    out = pathlib.Path(args.out).expanduser() if args.out else md_path.with_suffix(".html")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(f"{out}  ({root.size()} nodes, {len(page) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
