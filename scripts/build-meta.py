"""
Rebuilds data/image-meta.json (which views exist per car) from what is actually in public/cars,
and data/image-boxes.json (each cutout's car bounding box, in % of the 2:1 canvas, shadow excluded)
so hotspots can be positioned on the car. Run after process-images.py.
"""
import json, re
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
meta, boxes = {}, {}
for d in sorted((ROOT / "public/cars").iterdir()):
    views = sorted({m.group(1) for f in d.glob("*-640.webp") if (m := re.match(r"^((?:hero|side|rear|alt|doors|interior-\d|detail-\d)|[a-z]+-\d)-640\.webp$", f.name))})
    meta[d.name] = views
    boxes[d.name] = {}
    for v in views:
        if v.split("-")[0] in {"hero", "side", "rear", "alt", "doors"}:
            a = np.array(Image.open(d / f"{v}-640.webp").getchannel("A"))
            ys, xs = np.where(a > 185)  # generated shadow peaks at ~155, so this keeps only the car
            h, w = a.shape
            boxes[d.name][v] = [round(xs.min() / w * 100, 1), round(ys.min() / h * 100, 1), round(xs.max() / w * 100, 1), round(ys.max() / h * 100, 1)]
for p in ["parts", "workshop"]:
    if (ROOT / "public" / p).exists():
        meta[p] = sorted({f.name.rsplit("-", 1)[0] for f in (ROOT / "public" / p).glob("*.webp")})
(ROOT / "data/image-meta.json").write_text(json.dumps(meta, indent=2))
(ROOT / "data/image-boxes.json").write_text(json.dumps(boxes, indent=2))
print({k: len(v) for k, v in meta.items()})
