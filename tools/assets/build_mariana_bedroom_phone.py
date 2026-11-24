"""Composição diegética — quarto de Mariana, celular no chão (cena 03/11)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "public/assets/backgrounds/processed/apartment/mariana/mariana-apt-bedroom.jpg"
OUT = ROOT / "public/assets/backgrounds/processed/apartment/mariana/mariana-apt-bedroom-phone.jpg"


def main() -> None:
    base = Image.open(SRC).convert("RGBA")
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Penumbra de manhã + viés frio no chão
    for y in range(h):
        t = y / h
        alpha = int(35 + 120 * (t**1.6))
        draw.line([(0, y), (w, y)], fill=(8, 10, 18, alpha))

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = int(w * 0.52), int(h * 0.78)
    for r in range(220, 0, -4):
        a = int(8 + (220 - r) * 0.35)
        gdraw.ellipse((cx - r, cy - r // 2, cx + r, cy + r // 2), fill=(120, 160, 220, a))
    glow = glow.filter(ImageFilter.GaussianBlur(12))

    phone_w, phone_h = int(w * 0.11), int(w * 0.19)
    px, py = cx - phone_w // 2, cy - phone_h // 2
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (px + 8, py + 12, px + phone_w + 8, py + phone_h + 12),
        radius=18,
        fill=(0, 0, 0, 100),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))

    phone = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(phone)
    pd.rounded_rectangle((px, py, px + phone_w, py + phone_h), radius=16, fill=(12, 14, 20, 255))
    pd.rounded_rectangle(
        (px + 5, py + 8, px + phone_w - 5, py + phone_h - 14),
        radius=12,
        fill=(32, 48, 82, 255),
    )
    pd.rounded_rectangle(
        (px + 8, py + 11, px + phone_w - 8, py + phone_h - 18),
        radius=10,
        fill=(90, 140, 210, 90),
    )
    pd.ellipse((cx - 5, py + phone_h - 10, cx + 5, py + phone_h - 2), fill=(40, 44, 56, 255))

    out = Image.alpha_composite(base, layer)
    out = Image.alpha_composite(out, shadow)
    out = Image.alpha_composite(out, glow)
    out = Image.alpha_composite(out, phone)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.convert("RGB").save(OUT, quality=92)
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()