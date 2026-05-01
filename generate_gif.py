import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH, HEIGHT = 800, 600
FPS = 30
DURATION_SEC = 5
TOTAL_FRAMES = FPS * DURATION_SEC

# Colors
BG_COLOR = (17, 24, 33) # #111821
PANEL_COLOR = (30, 41, 59) # #1e293b
BLUE_COLOR = (25, 120, 229) # #1978e5
GREEN_COLOR = (34, 197, 94) # #22c55e
WHITE = (255, 255, 255)
GRAY = (148, 163, 184) # #94a3b8

def get_font(size):
    try:
        return ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", size)
    except:
        try:
            return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
        except:
            return ImageFont.load_default()

def draw_rounded_rect(draw, bounds, radius, fill):
    x0, y0, x1, y1 = bounds
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + radius * 2, y0 + radius * 2], 180, 270, fill=fill)
    draw.pieslice([x1 - radius * 2, y0, x1, y0 + radius * 2], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - radius * 2, x0 + radius * 2, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - radius * 2, y1 - radius * 2, x1, y1], 0, 90, fill=fill)

def create_frame(frame_num):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw Background Grid (subtle)
    for i in range(0, WIDTH, 40):
        draw.line([(i, 0), (i, HEIGHT)], fill=(25, 35, 48), width=1)
    for i in range(0, HEIGHT, 40):
        draw.line([(0, i), (WIDTH, i)], fill=(25, 35, 48), width=1)
        
    font_large = get_font(32)
    font_med = get_font(24)
    font_small = get_font(18)
    
    # Header
    draw.text((40, 40), "LiftLegend", font=font_large, fill=WHITE)
    draw.text((40, 85), "QR Scanner", font=font_med, fill=GRAY)
    
    # Timing logic
    scan_end = 75 # 2.5 seconds scanning
    success_end = 90 # flash green
    
    center_x, center_y = WIDTH//2, HEIGHT//2 - 20
    qr_size = 240
    
    if frame_num < scan_end:
        # Scanning Phase
        # Pulsing box
        pulse = (math.sin(frame_num * 0.2) + 1) / 2
        box_color = (int(BLUE_COLOR[0] * pulse), int(BLUE_COLOR[1] * pulse), int(BLUE_COLOR[2] * pulse))
        
        # Draw QR code bounding box corners
        corner_len = 40
        thick = 6
        x1, y1 = center_x - qr_size//2, center_y - qr_size//2
        x2, y2 = center_x + qr_size//2, center_y + qr_size//2
        
        for color in [(60, 80, 110), box_color]:
            offset = 0 if color == box_color else 4
            draw.line([(x1-offset, y1-offset), (x1+corner_len-offset, y1-offset)], fill=color, width=thick)
            draw.line([(x1-offset, y1-offset), (x1-offset, y1+corner_len-offset)], fill=color, width=thick)
            
            draw.line([(x2+offset, y1-offset), (x2-corner_len+offset, y1-offset)], fill=color, width=thick)
            draw.line([(x2+offset, y1-offset), (x2+offset, y1+corner_len-offset)], fill=color, width=thick)
            
            draw.line([(x1-offset, y2+offset), (x1+corner_len-offset, y2+offset)], fill=color, width=thick)
            draw.line([(x1-offset, y2+offset), (x1-offset, y2-corner_len+offset)], fill=color, width=thick)
            
            draw.line([(x2+offset, y2+offset), (x2-corner_len+offset, y2+offset)], fill=color, width=thick)
            draw.line([(x2+offset, y2+offset), (x2+offset, y2-corner_len+offset)], fill=color, width=thick)
            
        # Draw scanning line
        scan_y = y1 + ((frame_num % 40) / 40) * qr_size
        draw.line([(x1, scan_y), (x2, scan_y)], fill=BLUE_COLOR, width=4)
        
        # Scan text
        txt = "Align QR Code to scan..."
        draw.text((center_x - 120, y2 + 40), txt, font=font_med, fill=GRAY)
        
    else:
        # Success Phase
        if frame_num < success_end:
            # Flash background
            flash_intensity = 1.0 - (frame_num - scan_end) / (success_end - scan_end)
            bg_flash = (int(BG_COLOR[0] + (GREEN_COLOR[0]-BG_COLOR[0])*flash_intensity*0.1),
                        int(BG_COLOR[1] + (GREEN_COLOR[1]-BG_COLOR[1])*flash_intensity*0.1),
                        int(BG_COLOR[2] + (GREEN_COLOR[2]-BG_COLOR[2])*flash_intensity*0.1))
            
            # Create a simple flat color for background flash instead of pasting over grid
            flash_img = Image.new("RGB", (WIDTH, HEIGHT), bg_flash)
            # Re-draw grid on flash
            draw_flash = ImageDraw.Draw(flash_img)
            for i in range(0, WIDTH, 40): draw_flash.line([(i, 0), (i, HEIGHT)], fill=(25, 35, 48), width=1)
            for i in range(0, HEIGHT, 40): draw_flash.line([(0, i), (WIDTH, i)], fill=(25, 35, 48), width=1)
            draw_flash.text((40, 40), "LiftLegend", font=font_large, fill=WHITE)
            draw_flash.text((40, 85), "QR Scanner", font=font_med, fill=GRAY)
            img = flash_img
            draw = draw_flash
            
        # Draw success card sliding up
        progress = min(1.0, (frame_num - scan_end) / 15.0)
        # ease out back
        ease = progress
        if progress < 1.0:
            ease = 1 - math.pow(1 - progress, 3)
        
        card_w, card_h = 500, 300
        card_x = center_x - card_w//2
        start_y = HEIGHT + 50
        end_y = center_y - card_h//2 + 30
        card_y = start_y + (end_y - start_y) * ease
        
        # Shadow
        shadow_rect = [card_x+10, card_y+10, card_x+card_w+10, card_y+card_h+10]
        draw_rounded_rect(draw, shadow_rect, 20, (5, 10, 15))
        
        # Card
        draw_rounded_rect(draw, [card_x, card_y, card_x+card_w, card_y+card_h], 20, PANEL_COLOR)
        
        # Success Circle
        circle_r = 40
        circle_y = card_y - 20
        draw.ellipse([center_x-circle_r, circle_y-circle_r, center_x+circle_r, circle_y+circle_r], fill=GREEN_COLOR)
        
        # Checkmark
        draw.line([(center_x-15, circle_y+5), (center_x-5, circle_y+15), (center_x+15, circle_y-10)], fill=WHITE, width=6)
        
        draw.text((center_x-110, card_y + 60), "Check-in Successful", font=font_med, fill=WHITE)
        
        draw.text((card_x + 50, card_y + 130), "Name:", font=font_small, fill=GRAY)
        draw.text((card_x + 180, card_y + 130), "Rakib Hasan", font=font_med, fill=WHITE)
        
        draw.text((card_x + 50, card_y + 180), "Plan:", font=font_small, fill=GRAY)
        draw.text((card_x + 180, card_y + 180), "Advanced (Active)", font=font_med, fill=GREEN_COLOR)
        
        draw.text((card_x + 50, card_y + 230), "Time:", font=font_small, fill=GRAY)
        draw.text((card_x + 180, card_y + 230), "Today, 05:30 PM", font=font_med, fill=WHITE)

    return img

print("Generating frames...")
frames = []
for i in range(TOTAL_FRAMES):
    frames.append(create_frame(i))
    if i % 30 == 0:
        print(f"Frame {i}/{TOTAL_FRAMES}...")

print("Saving GIF...")
frames[0].save('public/demo-scan.gif', format='GIF',
               append_images=frames[1:],
               save_all=True,
               duration=1000//FPS, loop=0)
print("Done!")
