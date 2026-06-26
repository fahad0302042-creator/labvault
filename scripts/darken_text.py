"""
Darken muted text colors for better contrast on white background.
slate-400 → slate-600 (labels, captions)
slate-500 → slate-700 (secondary text, descriptions)

Also restore warm card tints:
- bg-white on cards → keep white for main cards, but add subtle slate-50 fills for list items
"""
from pathlib import Path

SWAPS = [
    # Darken muted text — these are the main culprits for "washed out" text
    ("text-slate-400", "text-slate-600"),
    ("text-slate-500", "text-slate-700"),

    # Keep placeholder text slightly lighter (not full dark) but still readable
    ("placeholder:text-slate-400", "placeholder:text-slate-500"),

    # Darken the muted-foreground variable usage
    # (no direct swap needed — handled by CSS var change)

    # Restore some warm card tints for list items (not pure white)
    # We'll do this selectively in components, not globally
]

BASE = Path("/home/z/my-project/src")
files = list((BASE / "components" / "lab").rglob("*.tsx")) + \
        list((BASE / "components" / "lab").rglob("*.ts")) + \
        [(BASE / "app" / "globals.css")]

changed = []
for f in files:
    text = f.read_text()
    orig = text
    for src, dst in SWAPS:
        text = text.replace(src, dst)
    if text != orig:
        f.write_text(text)
        changed.append(f.name)

print(f"Darkened text in {len(changed)} files:")
for n in sorted(set(changed)):
    print(f"  - {n}")
