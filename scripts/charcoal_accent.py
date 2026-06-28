"""
Replace all burnt orange classes with soft charcoal (stone) equivalents.
orange-600 → stone-900
orange-500 → stone-800
orange-700 → stone-950
orange-100 → stone-100
orange-50 → stone-100
orange-200 → stone-300
orange-400 → stone-600
"""
from pathlib import Path

SWAPS = [
    # Buttons — primary
    ("bg-orange-600", "bg-stone-900"),
    ("hover:bg-orange-500", "hover:bg-stone-800"),
    ("active:bg-orange-700", "active:bg-stone-950"),
    ("bg-orange-600/20", "bg-stone-900/20"),
    ("bg-orange-600/30", "bg-stone-900/30"),

    # Shadows
    ("shadow-orange-600/20", "shadow-stone-900/20"),
    ("shadow-orange-600/30", "shadow-stone-900/30"),
    ("shadow-orange-600/40", "shadow-stone-900/30"),
    ("shadow-orange-600/45", "shadow-stone-900/30"),

    # Gradients
    ("from-orange-500 to-orange-700", "from-stone-800 to-stone-950"),
    ("from-orange-500 to-orange-600", "from-stone-800 to-stone-900"),
    ("from-orange-600 to-orange-800", "from-stone-900 to-stone-950"),

    # Text
    ("text-orange-600", "text-stone-900"),
    ("text-orange-700", "text-stone-900"),
    ("text-orange-500", "text-stone-700"),
    ("text-orange-400", "text-stone-600"),
    ("hover:text-orange-600", "hover:text-stone-900"),

    # Backgrounds
    ("bg-orange-100", "bg-stone-100"),
    ("bg-orange-50", "bg-stone-100"),

    # Borders / rings
    ("border-orange-200", "border-stone-300"),
    ("focus:border-orange-500", "focus:border-stone-700"),
    ("focus:ring-orange-100", "focus:ring-stone-200"),
    ("ring-orange-200/60", "ring-stone-300/60"),
    ("ring-orange-500", "ring-stone-900"),

    # Badge tones — teal was already remapped to orange, now to stone
    ("bg-orange-100 text-orange-700 ring-orange-200/60", "bg-stone-100 text-stone-700 ring-stone-300/60"),

    # Dot colors
    ("bg-orange-600", "bg-stone-900"),

    # RGBA shadows
    ("rgba(194,65,12,", "rgba(41,37,36,"),
    ("rgba(194, 65, 12,", "rgba(41, 37, 36,"),

    # Scanner scan line + accent
    ("bg-orange-400", "bg-stone-600"),
    ("shadow-[0_0_8px_2px_rgba(194,65,12,0.6)]", "shadow-[0_0_8px_2px_rgba(41,37,36,0.6)]"),
]

BASE = Path("/home/z/my-project/src")
files = list((BASE / "components" / "lab").rglob("*.tsx")) + \
        list((BASE / "components" / "lab").rglob("*.ts")) + \
        list((BASE / "components").rglob("*.tsx"))

changed = []
for f in files:
    text = f.read_text()
    orig = text
    for src, dst in SWAPS:
        text = text.replace(src, dst)
    if text != orig:
        f.write_text(text)
        changed.append(f.name)

print(f"Charcoal-ified {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
