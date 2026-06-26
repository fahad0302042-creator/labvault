"""
Replace all remaining bg-graphite/text-graphite/etc with explicit orange classes.
This ensures the burnt orange accent is applied consistently.
"""
from pathlib import Path

SWAPS = [
    # Buttons
    ("bg-graphite py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500",
     "bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500"),
    ("bg-graphite px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500",
     "bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500"),
    ("bg-graphite py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-500",
     "bg-orange-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-500"),

    # Swipe toast
    ("bg-graphite px-4 py-3 text-white shadow-2xl",
     "bg-stone-900 px-4 py-3 text-white shadow-2xl"),

    # Modal backdrop
    ("bg-graphite/30 backdrop-blur-sm",
     "bg-stone-900/30 backdrop-blur-sm"),

    # Focus border
    ("focus:border-graphite focus:ring-2 focus:ring-stone-200",
     "focus:border-orange-500 focus:ring-2 focus:ring-orange-100"),
]

BASE = Path("/home/z/my-project/src")
files = list((BASE / "components" / "lab").rglob("*.tsx")) + \
        list((BASE / "components" / "lab").rglob("*.ts"))

changed = []
for f in files:
    text = f.read_text()
    orig = text
    for src, dst in SWAPS:
        text = text.replace(src, dst)
    if text != orig:
        f.write_text(text)
        changed.append(f.name)

print(f"Fixed {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
