"""
Generate 6 UI mockup images showing different accent colors
on the warm notebook palette. Each mockup shows a dashboard card
with KPIs, a chemical card, and a button — so you can see how
the accent color feels in context.
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Color palettes — each has [accent, accent_dark, accent_light]
PALETTES = {
    "forest-green": {
        "name": "Forest Green",
        "accent": "#166534",
        "accent_dark": "#14532D",
        "accent_light": "#DCFCE7",
        "desc": "Lab bottles, organic chemistry",
    },
    "deep-navy": {
        "name": "Deep Navy",
        "accent": "#1E3A5F",
        "accent_dark": "#172554",
        "accent_light": "#DBEAFE",
        "desc": "Institutional, professional",
    },
    "muted-teal": {
        "name": "Muted Teal",
        "accent": "#0F766E",
        "accent_dark": "#115E59",
        "accent_light": "#CCFBF1",
        "desc": "Copper sulfate, calm science",
    },
    "burgundy": {
        "name": "Burgundy",
        "accent": "#991B1B",
        "accent_dark": "#7F1D1D",
        "accent_light": "#FEE2E2",
        "desc": "Leather textbook, academic",
    },
    "charcoal": {
        "name": "Soft Charcoal",
        "accent": "#292524",
        "accent_dark": "#1C1917",
        "accent_light": "#F5F1EA",
        "desc": "Minimal monochrome",
    },
    "indigo": {
        "name": "Indigo",
        "accent": "#4338CA",
        "accent_dark": "#3730A3",
        "accent_light": "#E0E7FF",
        "desc": "Modern notebook app",
    },
}

CREAM_BG = "#FAF8F3"
CARD_BG = "#FFFFFF"
TEXT_DARK = "#292524"
TEXT_MUTED = "#57534E"
STONE_BORDER = "#E7E0D5"

# Try to load a nice font
def load_font(size):
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def draw_mockup(palette_key, palette, output_path):
    W, H = 400, 700
    img = Image.new("RGB", (W, H), CREAM_BG)
    draw = ImageDraw.Draw(img)

    accent = palette["accent"]
    accent_dark = palette["accent_dark"]
    accent_light = palette["accent_light"]

    # Fonts
    f_title = load_font(22)
    f_h2 = load_font(16)
    f_body = load_font(13)
    f_small = load_font(11)
    f_kpi = load_font(28)

    # --- Header ---
    draw.text((24, 30), "LabVault", fill=accent, font=f_title)
    draw.text((24, 58), palette["name"], fill=TEXT_MUTED, font=f_small)
    draw.text((24, 74), palette["desc"], fill=TEXT_MUTED, font=f_small)

    # --- KPI card ---
    kpi_y = 110
    # Card 1
    draw.rounded_rectangle([24, kpi_y, 190, kpi_y + 90], radius=12, fill=CARD_BG, outline=STONE_BORDER, width=1)
    # Accent icon circle
    draw.ellipse([36, kpi_y + 12, 64, kpi_y + 40], fill=accent)
    draw.text((42, kpi_y + 16), "🧪", fill="white", font=f_small)
    draw.text((36, kpi_y + 48), "160", fill=TEXT_DARK, font=f_kpi)
    draw.text((36, kpi_y + 80), "CHEMICALS", fill=TEXT_MUTED, font=f_small)

    # Card 2
    draw.rounded_rectangle([210, kpi_y, 376, kpi_y + 90], radius=12, fill=CARD_BG, outline=STONE_BORDER, width=1)
    draw.ellipse([222, kpi_y + 12, 250, kpi_y + 40], fill=accent)
    draw.text((228, kpi_y + 16), "⚗", fill="white", font=f_small)
    draw.text((222, kpi_y + 48), "105", fill=TEXT_DARK, font=f_kpi)
    draw.text((222, kpi_y + 80), "APPARATUS", fill=TEXT_MUTED, font=f_small)

    # --- Section title ---
    draw.text((24, 230), "RECENT ACTIVITY", fill=TEXT_MUTED, font=f_small)

    # --- Activity card ---
    act_y = 250
    draw.rounded_rectangle([24, act_y, 376, act_y + 180], radius=12, fill=CARD_BG, outline=STONE_BORDER, width=1)

    # Row 1
    draw.ellipse([36, act_y + 14, 60, act_y + 38], fill=accent_light)
    draw.text((42, act_y + 18), "↓", fill=accent, font=f_small)
    draw.text((72, act_y + 14), "Sodium Chloride", fill=TEXT_DARK, font=f_body)
    draw.text((72, act_y + 32), "You · 2m ago", fill=TEXT_MUTED, font=f_small)
    # Badge
    badge_w = 70
    draw.rounded_rectangle([376 - badge_w - 12, act_y + 14, 376 - 12, act_y + 32], radius=8, fill=accent_light, outline=accent_light)
    draw.text((376 - badge_w - 4, act_y + 16), "Consumed", fill=accent, font=f_small)

    # Divider
    draw.line([(36, act_y + 56), (376 - 12, act_y + 56)], fill=STONE_BORDER, width=1)

    # Row 2
    draw.ellipse([36, act_y + 66, 60, act_y + 90], fill="#FEF3C7")
    draw.text((42, act_y + 70), "↑", fill="#D97706", font=f_small)
    draw.text((72, act_y + 66), "Hydrochloric Acid", fill=TEXT_DARK, font=f_body)
    draw.text((72, act_y + 84), "You · 1h ago", fill=TEXT_MUTED, font=f_small)
    draw.rounded_rectangle([376 - badge_w - 12, act_y + 66, 376 - 12, act_y + 84], radius=8, fill="#DCFCE7", outline="#DCFCE7")
    draw.text((376 - badge_w + 2, act_y + 68), "Restocked", fill="#16A34A", font=f_small)

    # Divider
    draw.line([(36, act_y + 108), (376 - 12, act_y + 108)], fill=STONE_BORDER, width=1)

    # Row 3
    draw.ellipse([36, act_y + 118, 60, act_y + 142], fill="#FEE2E2")
    draw.text((42, act_y + 122), "↓", fill="#DC2626", font=f_small)
    draw.text((72, act_y + 118), "Test Tube", fill=TEXT_DARK, font=f_body)
    draw.text((72, act_y + 136), "You · 3h ago", fill=TEXT_MUTED, font=f_small)
    draw.rounded_rectangle([376 - badge_w - 12, act_y + 118, 376 - 12, act_y + 136], radius=8, fill="#FEE2E2", outline="#FEE2E2")
    draw.text((376 - badge_w + 8, act_y + 120), "Broken", fill="#DC2626", font=f_small)

    # --- Chemical card ---
    chem_y = 460
    draw.rounded_rectangle([24, chem_y, 376, chem_y + 90], radius=12, fill=accent_light, outline=STONE_BORDER, width=1)
    draw.text((36, chem_y + 16), "Sodium Chloride", fill=TEXT_DARK, font=f_body)
    draw.text((36, chem_y + 36), "NaCl", fill=TEXT_MUTED, font=f_small)
    # Quantity on right
    draw.text((300, chem_y + 16), "490g", fill=TEXT_DARK, font=f_body)
    draw.text((300, chem_y + 36), "of 500g", fill=TEXT_MUTED, font=f_small)
    # Stock bar
    bar_y = chem_y + 60
    draw.rounded_rectangle([36, bar_y, 376 - 12, bar_y + 8], radius=4, fill="#E7E0D5")
    draw.rounded_rectangle([36, bar_y, 36 + int((376 - 12 - 36) * 0.98), bar_y + 8], radius=4, fill=accent)
    # Percentage badge
    badge2_w = 40
    draw.rounded_rectangle([376 - badge2_w - 12, chem_y + 70, 376 - 12, chem_y + 86], radius=8, fill=accent, outline=accent)
    draw.text((376 - badge2_w + 2, chem_y + 72), "98%", fill="white", font=f_small)

    # --- Button ---
    btn_y = 580
    draw.rounded_rectangle([24, btn_y, 376, btn_y + 48], radius=12, fill=accent)
    draw.text((170, btn_y + 16), "Add Chemical", fill="white", font=f_body)

    # --- Bottom nav ---
    nav_y = 650
    draw.rounded_rectangle([0, nav_y, 400, 700], radius=0, fill=CARD_BG, outline=STONE_BORDER, width=1)
    # 5 nav items
    nav_labels = ["Home", "Chemicals", "Apparatus", "Scan", "Reports"]
    nav_colors = [accent, TEXT_MUTED, TEXT_MUTED, TEXT_MUTED, TEXT_MUTED]
    for i, (label, color) in enumerate(zip(nav_labels, nav_colors)):
        x = 40 + i * 72
        draw.text((x, nav_y + 18), label, fill=color, font=f_small)
        # Active indicator
        if i == 0:
            draw.rounded_rectangle([x - 4, nav_y, x + 40, nav_y + 3], radius=2, fill=accent)

    img.save(output_path, "PNG")
    print(f"  ✓ {output_path}")

# Generate all 6 mockups
output_dir = "/home/z/my-project/download/ui-mockups"
os.makedirs(output_dir, exist_ok=True)

print("Generating UI mockups...")
for key, palette in PALETTES.items():
    output_path = f"{output_dir}/mockup-{key}.png"
    draw_mockup(key, palette, output_path)

print(f"\nDone! 6 mockups saved to {output_dir}/")
