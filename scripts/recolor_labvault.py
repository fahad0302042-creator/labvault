"""
LabVault recolor: swap all teal/sky/cyan Tailwind classes for graphite/slate.
"""
from pathlib import Path

SWAPS = [
    # Multi-color gradients (page header icons)
    ("from-sky-400 to-cyan-500", "from-slate-700 to-slate-900"),

    # focus states (form inputs)
    ("focus:border-sky-400 focus:ring-2 focus:ring-sky-200",
     "focus:border-slate-400 focus:ring-2 focus:ring-slate-200"),

    # Primary buttons
    ("bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400",
     "bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800"),
    ("bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400",
     "bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800"),
    ("bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/40 transition-all hover:bg-sky-400 active:scale-95",
     "bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/40 transition-all hover:bg-slate-800 active:scale-95"),

    # Filter pills / segment controls active
    ("\"bg-sky-500 text-white shadow-sm\"",
     "\"bg-slate-900 text-white shadow-sm\""),

    # Reports weekly pill
    ("absolute inset-0 rounded-lg bg-sky-500 shadow-sm",
     "absolute inset-0 rounded-lg bg-slate-900 shadow-sm"),

    # ActionButton teal tone
    ("teal: \"bg-sky-50 text-sky-700 hover:bg-sky-100 ring-sky-200/60\"",
     "teal: \"bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-200/60\""),

    # Add chemical hero panel
    ("bg-sky-50/80 p-3 ring-1 ring-inset ring-sky-100",
     "bg-slate-50/80 p-3 ring-1 ring-inset ring-slate-100"),
    ("bg-sky-100 text-sky-600", "bg-slate-100 text-slate-700"),
    ("text-sky-900", "text-slate-900"),
    ("text-sky-700", "text-slate-700"),

    # Scanner UI — white accents on dark viewport for high contrast
    ("bg-sky-500/20 text-sky-300", "bg-white/15 text-white"),
    ("border-sky-400", "border-white/70"),
    ("border-sky-300/80", "border-white/50"),
    ("bg-sky-400 shadow-[0_0_8px_2px_rgba(14,165,233,0.8)]",
     "bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]"),
    ("bg-sky-500/10 blur-2xl", "bg-white/5 blur-2xl"),
    ("bg-cyan-400/10 blur-2xl", "bg-white/5 blur-2xl"),

    # Misc remaining
    ("text-sky-600", "text-slate-900"),
    ("bg-sky-500/30 hover:bg-sky-400", "bg-slate-900/30 hover:bg-slate-800"),
]

BASE = Path("/home/z/my-project/src/components/lab")
files = list(BASE.rglob("*.tsx")) + list(BASE.rglob("*.ts"))

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
for n in changed:
    print(f"  - {n}")
