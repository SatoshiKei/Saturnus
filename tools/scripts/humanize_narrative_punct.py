#!/usr/bin/env python3
"""Substitui travessão (—) e ponto e vírgula em strings narrativas PT (fala natural)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SCAN_ROOTS = [
    ROOT / "src" / "data",
    ROOT / "src" / "game" / "story",
    ROOT / "src" / "components" / "story",
    ROOT / "src" / "components" / "investigation",
    ROOT / "src" / "apps" / "whatsapp",
    ROOT / "src" / "lib",
]

SKIP_PATH_PARTS = (
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".mp3",
    ".wav",
    "/assets/",
    "P10_ASSETS",
    "BG-",
    "SP-0",
    "posterSrc",
    "spriteSrc",
    "bgSrc",
)

# Arquivos só com paths/metadata técnica — não reescrever strings inteiras aqui
SKIP_FILES = {
    "caseProgress.ts",
    "labels.ts",
    "diaryPinSounds.ts",
    "characterSprites.ts",
    "saveThumbnail.ts",
    "sfx.ts",
    "phoneApps.ts",
    "assetPath.ts",
}


def is_asset_string(s: str) -> bool:
    return any(p in s for p in SKIP_PATH_PARTS)


def fix_em_dash(s: str) -> str:
    prev = None
    out = s
    while prev != out and "—" in out:
        prev = out

        def repl(m: re.Match[str]) -> str:
            after = m.group(1)
            if not after:
                return ". "
            if after[0].isupper() or after.startswith(("mas ", "só ", "sem ", "não ", "e ")):
                return ". " + after
            return ", " + after

        out = re.sub(r"\s*—\s*(\S.*)", repl, out)
        out = re.sub(r"\s*—\s*$", ".", out)
    return out


def fix_semicolon(s: str) -> str:
    if ";" not in s:
        return s
    # Preserva imports/URLs acidentais
    if "://" in s or s.strip().startswith("import "):
        return s
    out = re.sub(r";\s+", ". ", s)
    out = re.sub(r";", ". ", out)
    out = re.sub(r"\.\s+\.", ".", out)
    return out


def humanize_string(s: str) -> str:
    if is_asset_string(s):
        return s
    s = fix_semicolon(s)
    s = fix_em_dash(s)
    s = re.sub(r" +", " ", s)
    s = re.sub(r"\.\s+\.", ".", s)
    return s


STRING_PAT = re.compile(
    r"(?P<q>['\"])(?P<body>(?:\\.|(?!\1).)*)(?P=q)",
    re.DOTALL,
)


def process_file(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return False
    text = path.read_text(encoding="utf-8")
    changed = False

    def sub(m: re.Match[str]) -> str:
        nonlocal changed
        q = m.group("q")
        body = m.group("body")
        if "—" not in body and ";" not in body:
            return m.group(0)
        if body.strip() in ("—", "–", "-"):
            return m.group(0)
        if is_asset_string(body):
            return m.group(0)
        new_body = humanize_string(body)
        if new_body != body:
            changed = True
            return f"{q}{new_body}{q}"
        return m.group(0)

    new_text = STRING_PAT.sub(sub, text)
    if changed:
        path.write_text(new_text, encoding="utf-8")
    return changed


def main() -> int:
    touched: list[str] = []
    for base in SCAN_ROOTS:
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.ts")):
            if process_file(path):
                touched.append(str(path.relative_to(ROOT)))
    for rel in touched:
        print(rel)
    print(f"--- {len(touched)} arquivos")
    return 0


if __name__ == "__main__":
    sys.exit(main())