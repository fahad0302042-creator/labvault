"""
Generate 6 logo options for LabVault.
Each is a clean, modern SVG on a charcoal or cream background.
"""
from PIL import Image, ImageDraw, ImageFont
import os

CHARCOAL = "#292524"
CREAM = "#FAF8F3"
WHITE = "#FFFFFF"
STONE_LIGHT = "#F5F1EA"

def load_font(size, bold=True):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def draw_logo_1(draw, size):
    """Minimal flask outline + clean wordmark"""
    S = size
    cx = S // 2
    # Charcoal rounded square bg
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    # Flask — simple line drawing in cream
    flask_color = CREAM
    # Neck
    neck_w = S // 8
    neck_h = S // 6
    neck_top = S // 4
    cx_n = cx
    draw.line([(cx_n - neck_w//2, neck_top), (cx_n - neck_w//2, neck_top + neck_h)], fill=flask_color, width=max(2, S//40))
    draw.line([(cx_n + neck_w//2, neck_top), (cx_n + neck_w//2, neck_top + neck_h)], fill=flask_color, width=max(2, S//40))
    # Rim
    rim_w = S // 5
    draw.line([(cx_n - rim_w//2, neck_top), (cx_n + rim_w//2, neck_top)], fill=flask_color, width=max(2, S//40))
    # Body — trapezoid
    body_top = neck_top + neck_h
    body_bottom = int(S * 0.72)
    top_w = neck_w
    bot_w = S // 3
    draw.line([(cx_n - top_w//2, body_top), (cx_n - bot_w//2, body_bottom)], fill=flask_color, width=max(2, S//40))
    draw.line([(cx_n + top_w//2, body_top), (cx_n + bot_w//2, body_bottom)], fill=flask_color, width=max(2, S//40))
    draw.line([(cx_n - bot_w//2, body_bottom), (cx_n + bot_w//2, body_bottom)], fill=flask_color, width=max(2, S//40))
    # Liquid fill
    liquid_y = int(S * 0.58)
    draw.polygon([
        (cx_n - int(top_w * 0.5 + (bot_w - top_w) * 0.5 * (liquid_y - body_top) / (body_bottom - body_top)), liquid_y),
        (cx_n + int(top_w * 0.5 + (bot_w - top_w) * 0.5 * (liquid_y - body_top) / (body_bottom - body_top)), liquid_y),
        (cx_n + bot_w//2, body_bottom),
        (cx_n - bot_w//2, body_bottom),
    ], fill=CREAM)
    # Bubble
    draw.ellipse([cx_n - S//30, liquid_y + S//20, cx_n + S//30, liquid_y + S//20 + S//15], outline=flask_color, width=max(1, S//50))

def draw_logo_2(draw, size):
    """Bold 'LV' monogram in a rounded square"""
    S = size
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    f = load_font(int(S * 0.55))
    # Draw "LV" centered
    text = "LV"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((S - tw) // 2 - bbox[0], (S - th) // 2 - bbox[1] - S//20), text, fill=CREAM, font=f)
    # Small flask icon below
    f2 = load_font(int(S * 0.15))
    draw.text((S//2 - S//10, int(S * 0.75)), "🧪", fill=CREAM, font=f2)

def draw_logo_3(draw, size):
    """Hexagonal molecule / benzene ring"""
    S = size
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    cx, cy = S // 2, S // 2
    r = S // 3
    # Hexagon
    import math
    points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 2
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, outline=CREAM, width=max(2, S//35))
    # Inner circle (aromatic ring)
    draw.ellipse([cx - r//2, cy - r//2, cx + r//2, cy + r//2], outline=CREAM, width=max(1, S//50))

def draw_logo_4(draw, size):
    """Test tube with liquid — clean and minimal"""
    S = size
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    cx = S // 2
    tube_w = S // 5
    tube_h = int(S * 0.5)
    tube_top = S // 5
    # Tube outline (rounded bottom)
    draw.rounded_rectangle(
        [cx - tube_w//2, tube_top, cx + tube_w//2, tube_top + tube_h],
        radius=tube_w // 2,
        outline=CREAM,
        width=max(2, S//35),
    )
    # Liquid fill (bottom 40%)
    liquid_top = tube_top + int(tube_h * 0.55)
    draw.rounded_rectangle(
        [cx - tube_w//2 + max(2, S//35), liquid_top, cx + tube_w//2 - max(2, S//35), tube_top + tube_h - max(2, S//35)],
        radius=tube_w // 3,
        fill=CREAM,
    )
    # Rim at top
    rim_w = int(tube_w * 1.4)
    draw.line([(cx - rim_w//2, tube_top), (cx + rim_w//2, tube_top)], fill=CREAM, width=max(2, S//30))
    # Bubbles
    draw.ellipse([cx - S//25, liquid_top + S//15, cx - S//25 + S//20, liquid_top + S//15 + S//20], outline=CREAM, width=max(1, S//60))
    draw.ellipse([cx + S//40, liquid_top + S//10, cx + S//40 + S//18, liquid_top + S//10 + S//18], outline=CREAM, width=max(1, S//60))

def draw_logo_5(draw, size):
    """Atom with orbiting electrons"""
    S = size
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    cx, cy = S // 2, S // 2
    import math
    # Nucleus
    nucleus_r = S // 12
    draw.ellipse([cx - nucleus_r, cy - nucleus_r, cx + nucleus_r, cy + nucleus_r], fill=CREAM)
    # 3 orbital ellipses
    r_x = S // 3
    r_y = S // 7
    for angle in [0, 60, 120]:
        # Draw ellipse rotated
        points = []
        steps = 60
        for i in range(steps + 1):
            a = 2 * math.pi * i / steps
            x = r_x * math.cos(a)
            y = r_y * math.sin(a)
            # Rotate
            rad = math.radians(angle)
            xr = x * math.cos(rad) - y * math.sin(rad)
            yr = x * math.sin(rad) + y * math.cos(rad)
            points.append((cx + xr, cy + yr))
        draw.line(points, fill=CREAM, width=max(1, S//45))

def draw_logo_6(draw, size):
    """Minimal 'L' with a droplet"""
    S = size
    draw.rounded_rectangle([0, 0, S-1, S-1], radius=S//6, fill=CHARCOAL)
    # Large "L" letter
    f = load_font(int(S * 0.6))
    text = "L"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((S - tw) // 2 - bbox[0] - S//12, (S - th) // 2 - bbox[1] - S//20), text, fill=CREAM, font=f)
    # Droplet to the right of L
    dx = int(S * 0.62)
    dy = int(S * 0.5)
    dr = S // 8
    # Droplet shape (circle + triangle on top)
    draw.ellipse([dx - dr, dy - dr, dx + dr, dy + dr], fill=CREAM)
    draw.polygon([(dx - dr//2, dy - dr//3), (dx + dr//2, dy - dr//3), (dx, dy - dr - S//12)], fill=CREAM)

# Generate all 6 logos at 512x512
output_dir = "/home/z/my-project/download/logo-options"
os.makedirs(output_dir, exist_ok=True)

logos = [
    ("1-flask", "Minimal Flask", draw_logo_1),
    ("2-monogram", "LV Monogram", draw_logo_2),
    ("3-molecule", "Benzene Ring", draw_logo_3),
    ("4-testtube", "Test Tube", draw_logo_4),
    ("5-atom", "Atom Orbits", draw_logo_5),
    ("6-droplet", "L + Droplet", draw_logo_6),
]

print("Generating logo options...")
for key, name, draw_fn in logos:
    size = 512
    img = Image.new("RGB", (size, size), CHARCOAL)
    draw = ImageDraw.Draw(img)
    draw_fn(draw, size)
    output_path = f"{output_dir}/logo-{key}.png"
    img.save(output_path, "PNG")
    print(f"  ✓ {name} → {output_path}")

print(f"\nDone! 6 logos saved to {output_dir}/")
