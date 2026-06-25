"""
Replace cool slate-900/950 with warm graphite in lab components.
Keeps slate-500/600/700 (mid-tones for muted text) unchanged.
"""
from pathlib import Path

SWAPS = [
    # Darkest tones → warm graphite
    ("bg-slate-900", "bg-graphite"),
    ("text-slate-900", "text-graphite"),
    ("from-slate-700 to-slate-900", "from-slate-600 to-graphite"),
    ("from-slate-800 to-slate-950", "from-graphite to-graphite/90"),
    ("hover:bg-slate-800", "hover:bg-graphite/90"),
    ("hover:bg-slate-950", "hover:bg-graphite/90"),
    ("bg-slate-900/30", "bg-graphite/30"),
    ("shadow-slate-900/30", "shadow-graphite/30"),
    ("shadow-slate-900/40", "shadow-graphite/40"),
    ("shadow-slate-900/45", "shadow-graphite/45"),
    # rgba references
    ("rgba(29,29,31,", "rgba(42,37,32,"),
    ("rgba(14,165,233,", "rgba(42,37,32,"),  # leftover from old teal
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

print(f"Recolored {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
