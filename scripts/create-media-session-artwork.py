from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "img" / "media-session"
SIZES = (96, 128, 192, 256, 384, 512)
STATIONS = {
    "rhywaelle": ROOT / "img" / "Radio Rhywaelle.png",
    "winterlord": ROOT / "img" / "Winterlord FM Logo.png",
    "rhyrock": ROOT / "img" / "RhyRock.png",
}

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for station, source_path in STATIONS.items():
    with Image.open(source_path) as source:
        if source.width != source.height:
            raise ValueError(f"{source_path.name} ist nicht quadratisch: {source.size}")

        base = source.convert("RGBA" if source.mode in {"RGBA", "LA"} else "RGB")
        for size in SIZES:
            artwork = base.resize((size, size), Image.Resampling.LANCZOS)
            output_path = OUTPUT_DIR / f"{station}-{size}.png"
            artwork.save(output_path, format="PNG", optimize=True, compress_level=9)

            with Image.open(output_path) as check:
                if check.format != "PNG" or check.size != (size, size):
                    raise RuntimeError(f"Ungültige Ausgabedatei: {output_path}")

            print(f"Erstellt: {output_path.relative_to(ROOT)} ({size}x{size})")
