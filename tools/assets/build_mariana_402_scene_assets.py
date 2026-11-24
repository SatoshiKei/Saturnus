"""
Gera o fundo de interior da cena 402 (1920×1080). A porta é asset local (porta-angelim-solida-fri-13.webp).

Fonte interior: assets/manifest/mariana-402-scenes.json
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "assets/manifest/mariana-402-scenes.json"
CACHE = ROOT / "assets/backgrounds/raw/apartment/mariana-402"
OUT_DIR = ROOT / "public/assets/scenes/apartment"
INTERIOR_OUT = OUT_DIR / "mariana-402-interior-phone.jpg"

TARGET_W, TARGET_H = 1920, 1080


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Saturnus-asset-builder/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        dest.write_bytes(resp.read())


def cover(img: Image.Image, tw: int, th: int) -> Image.Image:
    w, h = img.size
    scale = max(tw / w, th / h)
    nw, nh = int(w * scale), int(h * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def build_interior(room_path: Path) -> None:
    img = Image.open(room_path).convert("RGB")
    w, h = img.size
    img = img.crop((0, int(h * 0.38), w, int(h * 0.95)))
    img = cover(img, TARGET_W, TARGET_H)
    img = ImageEnhance.Brightness(img).enhance(0.62)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Color(img).enhance(0.9)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img.save(INTERIOR_OUT, quality=93, optimize=True)


def main() -> None:
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_id = {e["id"]: e for e in entries}
    room_cache = CACHE / "interior-room.jpg"
    download(by_id["mariana-402-interior"]["url"], room_cache)
    build_interior(room_cache)
    print(INTERIOR_OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()