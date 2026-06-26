"""
Clean up low-opacity classes that hurt text readability.
Replace transparent backgrounds with solid colors.
"""
from pathlib import Path

SWAPS = [
    # Frosted glass → solid white
    ("bg-white/60", "bg-white"),
    ("bg-white/70", "bg-white"),
    ("bg-white/75", "bg-white"),
    ("bg-white/80", "bg-white"),
    ("bg-white/85", "bg-white"),
    ("bg-white/90", "bg-white"),

    # White borders with opacity → solid
    ("border-white/70", "border-slate-100"),
    ("border-white/80", "border-slate-100"),
    ("border-white/90", "border-slate-100"),

    # Backdrop blur → remove (we use solid bg now)
    ("backdrop-blur-2xl ", ""),
    ("backdrop-blur-xl ", ""),
    ("backdrop-blur-md ", ""),
    ("backdrop-blur-sm ", ""),

    # Slate backgrounds with low opacity → solid
    ("bg-slate-50/80", "bg-slate-50"),
    ("bg-slate-50/60", "bg-slate-50"),
    ("bg-slate-100/80", "bg-slate-100"),
    ("bg-slate-100/60", "bg-slate-100"),

    # Status backgrounds with low opacity → solid
    ("bg-amber-50/80", "bg-amber-50"),
    ("bg-amber-50/60", "bg-amber-50"),
    ("bg-amber-50/40", "bg-amber-50"),
    ("bg-red-50/80", "bg-red-50"),
    ("bg-red-50/60", "bg-red-50"),
    ("bg-red-50/40", "bg-red-50"),
    ("bg-emerald-50/80", "bg-emerald-50"),
    ("bg-emerald-50/60", "bg-emerald-50"),

    # Borders with opacity
    ("border-amber-200/60", "border-amber-200"),
    ("border-emerald-200/60", "border-emerald-200"),
    ("border-red-200/60", "border-red-200"),

    # Graphite with low opacity → solid slate
    ("bg-graphite/5", "bg-slate-100"),
    ("bg-graphite/8", "bg-slate-100"),
    ("border-graphite/10", "border-slate-100"),
    ("border-graphite/5", "border-slate-100"),

    # Divide with opacity → solid
    ("divide-slate-200/60", "divide-slate-200"),
    ("divide-slate-200/70", "divide-slate-200"),
    ("divide-slate-100/70", "divide-slate-100"),

    # Ring with opacity
    ("ring-white/80", "ring-slate-200"),
    ("ring-white/70", "ring-slate-200"),

    # Text shadow with low opacity references
    ("shadow-slate-900/30", "shadow-slate-900/20"),
    ("shadow-slate-900/40", "shadow-slate-900/20"),
    ("shadow-slate-900/45", "shadow-slate-900/20"),
    ("shadow-graphite/30", "shadow-graphite/20"),
    ("shadow-graphite/40", "shadow-graphite/20"),
    ("shadow-graphite/45", "shadow-graphite/20"),
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

print(f"Cleaned {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
