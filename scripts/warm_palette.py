"""
Swap cool slate-* colors for warm stone-* colors to match the Warm Notebook palette.
Also swap slate-* borders/fills for stone-*.
"""
from pathlib import Path

SWAPS = [
    # Text colors — slate → stone (warm)
    ("text-slate-900", "text-stone-900"),
    ("text-slate-800", "text-stone-800"),
    ("text-slate-700", "text-stone-700"),
    ("text-slate-600", "text-stone-600"),
    ("text-slate-500", "text-stone-500"),
    ("text-slate-400", "text-stone-500"),  # bump 400 → 500 for readability

    # Backgrounds
    ("bg-slate-50", "bg-stone-100"),
    ("bg-slate-100", "bg-stone-100"),
    ("bg-slate-200", "bg-stone-200"),

    # Borders
    ("border-slate-100", "border-stone-200"),
    ("border-slate-200", "border-stone-200"),
    ("border-slate-300", "border-stone-300"),

    # Rings
    ("ring-slate-100", "ring-stone-200"),
    ("ring-slate-200", "ring-stone-200"),
    ("ring-slate-300", "ring-stone-300"),

    # Divide
    ("divide-slate-100", "divide-stone-100"),
    ("divide-slate-200", "divide-stone-200"),

    # Placeholder
    ("placeholder:text-slate-500", "placeholder:text-stone-500"),
    ("placeholder:text-slate-600", "placeholder:text-stone-600"),

    # Hover states
    ("hover:bg-slate-50", "hover:bg-stone-100"),
    ("hover:bg-slate-100", "hover:bg-stone-100"),
    ("hover:bg-slate-200", "hover:bg-stone-200"),
    ("hover:text-slate-700", "hover:text-stone-700"),
    ("hover:text-graphite", "hover:text-orange-600"),

    # From/to gradients that used slate
    ("from-slate-600 to-graphite", "from-orange-500 to-orange-700"),
    ("from-slate-700 to-graphite", "from-orange-600 to-orange-800"),

    # Shadow colors
    ("shadow-slate-900/20", "shadow-stone-900/20"),
    ("shadow-slate-900/30", "shadow-stone-900/20"),
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

print(f"Warmed {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
