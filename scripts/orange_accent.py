"""
Swap remaining graphite button/bg references to burnt orange.
"""
from pathlib import Path

SWAPS = [
    # Primary buttons
    ("bg-graphite py-3 text-sm font-semibold text-white shadow-lg shadow-graphite/30 hover:bg-graphite/90",
     "bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500"),
    ("bg-graphite px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-graphite/30 hover:bg-graphite/90",
     "bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500"),
    ("bg-graphite px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-graphite/90",
     "bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-500"),

    # KPI gradient cards
    ("from-stone-600 to-graphite shadow-[0_8px_20px_-6px_rgba(42,37,32,0.35)]",
     "from-orange-500 to-orange-700 shadow-[0_8px_20px_-6px_rgba(194,65,12,0.4)]"),

    # Focus ring
    ("focus:border-graphite focus:ring-2 focus:ring-stone-100",
     "focus:border-orange-500 focus:ring-2 focus:ring-orange-100"),

    # Text graphite (headings) → stone-900 for warm dark text
    ("text-graphite", "text-stone-900"),

    # Remaining bg-graphite (small elements like avatar, progress)
    ("bg-graphite text-white", "bg-orange-600 text-white"),
    ("bg-graphite/90", "bg-orange-500"),
    ("bg-graphite/80", "bg-orange-500"),
    ("bg-graphite/8", "bg-orange-50"),

    # Border graphite
    ("border-graphite/10", "border-stone-200"),
    ("border-graphite/5", "border-stone-200"),

    # Ring graphite
    ("ring-graphite", "ring-orange-500"),

    # Shadow graphite
    ("shadow-graphite/20", "shadow-orange-600/20"),
    ("shadow-graphite/30", "shadow-orange-600/30"),
    ("shadow-graphite/40", "shadow-orange-600/30"),
    ("shadow-graphite/45", "shadow-orange-600/30"),

    # Spinner
    ("border-t-graphite", "border-t-orange-600"),
]

BASE = Path("/home/z/my-project/src")
files = list((BASE / "components" / "lab").rglob("*.tsx")) + \
        list((BASE / "components" / "lab").rglob("*.ts")) + \
        [(BASE / "app" / "page.tsx")]

changed = []
for f in files:
    text = f.read_text()
    orig = text
    for src, dst in SWAPS:
        text = text.replace(src, dst)
    if text != orig:
        f.write_text(text)
        changed.append(f.name)

print(f"Orange-ified {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
