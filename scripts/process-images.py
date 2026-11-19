"""
MAISON VELOCE — image processing pipeline.

    pip install "rembg[cpu]" pillow numpy opencv-python-headless
    python scripts/process-images.py              # everything
    python scripts/process-images.py mclaren-750s # one group

Input : assets-raw/{group}/*.jpg  (downloaded by fetch-images.ts, see scripts/picks.json)
Output: public/cars/{slug}/{view}-{640|1280|2400}.{webp,avif}
        public/cars/{slug}/{view}-{paintId}-{640|1280}.webp   (paint visualisations)
        public/parts/{part}-{640|1280}.{webp,avif}
        public/workshop/{name}-{640|1280|2400}.{webp,avif}
        assets-raw/_review/{group}.jpg  (contact sheet of the results, for eyeballing halos/missing parts)
        data/image-meta.json            (which views exist per car, used by the site)

Cutout views (hero / side / rear / alt / doors) get:
  plate blur (boxes in picks.json) -> rembg (isnet-general-use) -> keep the largest object
  -> trim -> scale so overall length fills 2000px of a 2400x1200 canvas, wheels on a common baseline (y=1060)
  -> light white-balance / exposure normalisation -> generated contact shadow.
"""
import json
import os
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets-raw"
PUB = ROOT / "public"
CUT_VIEWS = {"hero", "side", "rear", "alt", "doors"}
PART_CUT = {"wheel", "engine-w16", "engine-v12", "engine-v8", "gearbox", "turbo", "exhaust", "steering", "paint-gun"}
CANVAS = (2400, 1200)
BASELINE = 1060
CAR_LEN = 2000
SIZES = (640, 1280, 2400)

picks = json.loads((ROOT / "scripts/picks.json").read_text(encoding="utf8"))
paints = json.loads((ROOT / "scripts/paints.json").read_text(encoding="utf8")) if (ROOT / "scripts/paints.json").exists() else {}

_session = None


def session():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("isnet-general-use")
    return _session


def blur_plates(im: Image.Image, boxes):
    for b in boxes or []:
        w, h = im.size
        box = (int(b[0] * w), int(b[1] * h), int(b[2] * w), int(b[3] * h))
        region = im.crop(box).filter(ImageFilter.GaussianBlur(max(6, (box[2] - box[0]) // 6)))
        im.paste(region, box)
    return im


def cutout(im: Image.Image) -> Image.Image:
    from rembg import remove
    out = remove(im, session=session(), post_process_mask=True)
    a = np.array(out.getchannel("A"))
    # keep only the largest connected object (drops neighbouring cars, people, signage)
    n, labels, stats, _ = cv2.connectedComponentsWithStats((a > 100).astype(np.uint8), 8)
    if n > 2:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        keep = cv2.dilate((labels == biggest).astype(np.uint8), np.ones((9, 9), np.uint8))
        a = (a * keep).astype(np.uint8)
    # soften the matte edge 1px to kill fringe halos
    a = cv2.erode(a, np.ones((3, 3), np.uint8))
    a = cv2.GaussianBlur(a, (3, 3), 0)
    out.putalpha(Image.fromarray(a))
    return out


def normalise(rgba: Image.Image) -> Image.Image:
    """Gentle grey-world white balance + percentile exposure, applied 40/60 so paint colour survives."""
    arr = np.array(rgba).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3]
    m = a > 128
    if m.sum() < 100:
        return rgba
    px = rgb[m]
    means = px.mean(0)
    wb = means.mean() / np.maximum(means, 1)
    wb = 1 + (wb - 1) * 0.4
    lo, hi = np.percentile(px.mean(1), [1, 99.5])
    gain = 235 / max(hi - lo, 1)
    gain = 1 + (min(gain, 1.35) - 1) * 0.6
    rgb = np.clip((rgb * wb - lo * 0.4) * gain, 0, 255)
    arr[..., :3] = rgb
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def place_car(rgba: Image.Image) -> Image.Image:
    bbox = rgba.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    car = rgba.crop(bbox)
    s = CAR_LEN / car.width
    if car.height * s > 900:  # very tall 3/4 views: cap height instead
        s = 900 / car.height
    car = car.resize((round(car.width * s), round(car.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - car.width) // 2
    y = BASELINE - car.height
    # generated contact shadow: wide soft ellipse + tight dark core
    sh = Image.new("L", CANVAS, 0)
    d = ImageDraw.Draw(sh)
    cx, w = CANVAS[0] // 2, car.width
    d.ellipse((cx - w * 0.47, BASELINE - 60, cx + w * 0.47, BASELINE + 8), fill=125)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    core = Image.new("L", CANVAS, 0)
    ImageDraw.Draw(core).ellipse((cx - w * 0.4, BASELINE - 22, cx + w * 0.4, BASELINE + 2), fill=155)
    core = core.filter(ImageFilter.GaussianBlur(8))
    shadow_a = Image.fromarray(np.maximum(np.array(sh), np.array(core)))
    shadow = Image.new("RGBA", CANVAS, (14, 14, 14, 0))
    shadow.putalpha(shadow_a)
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.alpha_composite(car, (x, y))
    return canvas


def place_part(rgba: Image.Image) -> Image.Image:
    bbox = rgba.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    p = rgba.crop(bbox)
    s = 1000 / max(p.width, p.height)
    p = p.resize((round(p.width * s), round(p.height * s)), Image.LANCZOS)
    c = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
    c.alpha_composite(p, ((1200 - p.width) // 2, (1200 - p.height) // 2))
    return c


def export(im: Image.Image, dest: Path, sizes=SIZES, avif=True):
    dest.parent.mkdir(parents=True, exist_ok=True)
    for w in sizes:
        if w > im.width * 1.05 and w != sizes[0]:
            continue
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width != w else im
        r.save(f"{dest}-{w}.webp", "WEBP", quality=82, method=6)
        if avif:
            try:
                r.save(f"{dest}-{w}.avif", "AVIF", quality=60)
            except Exception:
                pass


def paint_variant(rgba: Image.Image, hex_target: str) -> Image.Image:
    """Recolour body panels only. Saturated paint: hue-band mask. Grey/white paint: bright low-sat mask."""
    arr = np.array(rgba)
    rgb = arr[..., :3].astype(np.float32)
    a = arr[..., 3] > 128
    hsv = cv2.cvtColor(arr[..., :3], cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    sat = a & (s > 0.32) & (v > 0.2)
    if sat.sum() > 0.2 * a.sum():
        hist = np.histogram(h[sat], bins=36, range=(0, 360))[0]
        dom = (np.argmax(hist) + 0.5) * 10
        dh = np.minimum(abs(h - dom), 360 - abs(h - dom))
        mask = sat & (dh < 28)
    else:
        mask = a & (s < 0.2) & (v > 0.48)
    m = cv2.GaussianBlur(mask.astype(np.float32), (5, 5), 0)[..., None]
    lum = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]) / 255
    ref = np.median(lum[mask]) if mask.any() else 0.5
    t = np.array([int(hex_target[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / np.float32(255)
    rel = (lum / np.float32(max(ref, 0.05)))[..., None].astype(np.float32)
    base = t * np.clip(rel, 0, 1.0)
    spec = np.clip(rel - 1, 0, 1) * 0.85  # keep reflections and highlights
    col = np.clip(base + spec * (1 - base), 0, 1) * 255
    out = rgb * (1 - m) + col * m
    arr[..., :3] = out.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def checker(size):
    c = Image.new("RGB", size, (255, 255, 255))
    d = ImageDraw.Draw(c)
    for y in range(0, size[1], 24):
        for x in range(0, size[0], 24):
            if (x // 24 + y // 24) % 2:
                d.rectangle((x, y, x + 23, y + 23), fill=(228, 228, 228))
    return c


def process_group(group: str, meta: dict):
    items = picks[group]
    review = []
    if group == "parts":
        out_dir = PUB / "parts"
    elif group == "workshop":
        out_dir = PUB / "workshop"
    else:
        out_dir = PUB / "cars" / group
    views = []
    for it in items:
        src = RAW / group / it["file"]
        if not src.exists():
            print(f"  MISSING {src.name}")
            continue
        role = it["role"]
        im = blur_plates(Image.open(src).convert("RGB"), it.get("blur"))
        if it.get("crop"):  # exclude neighbouring cars / people before matting (normalised box)
            c = it["crop"]; w, h = im.size
            im = im.crop((int(c[0] * w), int(c[1] * h), int(c[2] * w), int(c[3] * h)))
        if group == "parts":
            if role in PART_CUT:
                out = place_part(normalise(cutout(im)))
                export(out, out_dir / role, sizes=(640, 1200))
                review.append(out)
            else:
                export(im, out_dir / f"{role}-photo", sizes=(640, 1280))
                review.append(im.convert("RGBA"))
            views.append(role)
        elif role in CUT_VIEWS:
            cut = cutout(im)
            for b in it.get("erase", []):  # remove fused signs / props (normalised to the cropped image)
                w, h = cut.size
                ImageDraw.Draw(a := cut.getchannel("A")).rectangle((int(b[0] * w), int(b[1] * h), int(b[2] * w), int(b[3] * h)), fill=0)
                cut.putalpha(a)
            out = place_car(normalise(cut))
            if it.get("flip"):
                out = out.transpose(Image.FLIP_LEFT_RIGHT)
            export(out, out_dir / role)
            review.append(out)
            views.append(role)
            for p in [q for q in paints.get(group, []) if not q.get("factory")]:
                export(paint_variant(out, p["hex"]), out_dir / f"{role}-{p['id']}", sizes=(640, 1280), avif=False)
        else:
            export(im, out_dir / role)
            review.append(im.convert("RGBA"))
            views.append(role)
        print(f"  ok {group}/{role}")
    meta[group] = views
    if review:
        tw = 600
        rows = [(r.resize((tw, round(r.height * tw / r.width)))) for r in review]
        H = sum(r.height for r in rows)
        sheet = checker((tw, H))
        y = 0
        for r in rows:
            sheet.paste(r, (0, y), r)
            y += r.height
        (RAW / "_review").mkdir(exist_ok=True)
        sheet.save(RAW / "_review" / f"{group}.jpg", quality=80)


def main():
    meta_path = ROOT / "data/image-meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    groups = sys.argv[1:] or list(picks.keys())
    for g in groups:
        print(g)
        process_group(g, meta)
    meta_path.write_text(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
