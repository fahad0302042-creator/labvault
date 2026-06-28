"""
Generate PWA icons (192x192 and 512x512) with the atom logo design.
"""
from PIL import Image, ImageDraw
import math
import os

CHARCOAL = (41, 37, 36, 255)   # #292524
CREAM = (250, 248, 243, 255)   # #FAF8F3

def create_icon(size, output_path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Charcoal rounded square background
    margin = 0
    radius = int(size * 0.167)  # 1/6
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        fill=CHARCOAL,
    )

    cx = size // 2
    cy = size // 2

    # Nucleus
    nucleus_r = int(size * 0.052)
    draw.ellipse(
        [cx - nucleus_r, cy - nucleus_r, cx + nucleus_r, cy + nucleus_r],
        fill=CREAM,
    )

    # 3 orbital ellipses
    r_x = int(size * 0.333)
    r_y = int(size * 0.107)
    stroke_w = max(2, int(size * 0.01))

    for angle_deg in [0, 60, 120]:
        angle = math.radians(angle_deg)
        # Generate ellipse points and rotate
        points = []
        steps = 80
        for i in range(steps + 1):
            a = 2 * math.pi * i / steps
            x = r_x * math.cos(a)
            y = r_y * math.sin(a)
            # Rotate
            xr = x * math.cos(angle) - y * math.sin(angle)
            yr = x * math.sin(angle) + y * math.cos(angle)
            points.append((cx + xr, cy + yr))
        # Draw as a thick line (polygon)
        draw.line(points, fill=CREAM, width=stroke_w, joint="curve")

    img.save(output_path, "PNG")
    print(f"  ✓ {output_path} ({size}x{size})")

# Generate both sizes
create_icon(192, "/home/z/my-project/public/icon-192.png")
create_icon(512, "/home/z/my-project/public/icon-512.png")
print("Done!")
