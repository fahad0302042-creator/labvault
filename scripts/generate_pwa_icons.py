"""
Generate PWA icons (192x192 and 512x512) for LabVault.
Uses Pillow to create a simple graphite rounded square with a white flask.
"""
from PIL import Image, ImageDraw
import os

def create_icon(size, output_path):
    """Create a LabVault app icon."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background — rounded square in graphite (#2A2520)
    margin = int(size * 0.05)
    radius = int(size * 0.22)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        fill=(42, 37, 32, 255),
    )

    # Flask icon — simple Erlenmeyer shape in white
    # Scale relative to icon size
    cx = size // 2
    # Neck (top rectangle)
    neck_w = int(size * 0.12)
    neck_h = int(size * 0.18)
    neck_top = int(size * 0.25)
    draw.rectangle(
        [cx - neck_w // 2, neck_top, cx + neck_w // 2, neck_top + neck_h],
        fill=(255, 255, 255, 255),
    )
    # Rim (top bar)
    rim_w = int(size * 0.20)
    rim_h = int(size * 0.04)
    draw.rectangle(
        [cx - rim_w // 2, neck_top - rim_h, cx + rim_w // 2, neck_top],
        fill=(255, 255, 255, 255),
    )
    # Body (triangle/trapezoid flaring out)
    body_top = neck_top + neck_h
    body_bottom = int(size * 0.72)
    top_w = neck_w
    bottom_w = int(size * 0.36)
    draw.polygon(
        [
            (cx - top_w // 2, body_top),
            (cx + top_w // 2, body_top),
            (cx + bottom_w // 2, body_bottom),
            (cx - bottom_w // 2, body_bottom),
        ],
        fill=(255, 255, 255, 255),
    )
    # Liquid line (slightly transparent white)
    liquid_y = int(size * 0.60)
    liquid_left = cx - int(bottom_w * 0.45 * (liquid_y - body_top) / (body_bottom - body_top)) - top_w // 2
    liquid_right = cx + int(bottom_w * 0.45 * (liquid_y - body_top) / (body_bottom - body_top)) + top_w // 2
    # Draw liquid as a filled portion below the line
    draw.polygon(
        [
            (cx - (top_w + (bottom_w - top_w) * (liquid_y - body_top) / (body_bottom - body_top)) // 2, liquid_y),
            (cx + (top_w + (bottom_w - top_w) * (liquid_y - body_top) / (body_bottom - body_top)) // 2, liquid_y),
            (cx + bottom_w // 2, body_bottom),
            (cx - bottom_w // 2, body_bottom),
        ],
        fill=(14, 165, 233, 200),  # teal liquid
    )

    img.save(output_path, "PNG")
    print(f"Created {output_path} ({size}x{size})")

# Generate both sizes
create_icon(192, "/home/z/my-project/public/icon-192.png")
create_icon(512, "/home/z/my-project/public/icon-512.png")
print("Done!")
