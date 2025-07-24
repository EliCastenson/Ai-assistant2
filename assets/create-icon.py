#!/usr/bin/env python3
"""
Simple icon generator for AI Productivity Assistant
Creates a PNG icon when ImageMagick is not available
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon():
        # Create a 512x512 image with transparent background
        size = 512
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw background circle with gradient effect (simulated)
        center = size // 2
        radius = 240
        
        # Background circle
        draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                    fill=(59, 130, 246, 255), outline=(30, 64, 175, 255), width=4)
        
        # Brain shape (simplified)
        brain_width = 120
        brain_height = 160
        brain_x = center - brain_width // 2
        brain_y = center - brain_height // 2
        
        # Main brain outline
        draw.ellipse([brain_x, brain_y, brain_x + brain_width, brain_y + brain_height], 
                    fill=(255, 255, 255, 255), outline=(209, 213, 219, 255), width=2)
        
        # Brain details (simplified wrinkles)
        for i, y_offset in enumerate([-60, -30, 0, 30]):
            y = center + y_offset
            draw.arc([brain_x + 10, y - 10, brain_x + brain_width - 10, y + 10], 
                    start=0, end=180, fill=(156, 163, 175, 255), width=2)
        
        # AI circuit dots
        dot_positions = [(-30, -40), (30, -40), (0, -20), (-20, 10), (20, 10)]
        for dx, dy in dot_positions:
            x, y = center + dx, center + dy
            draw.ellipse([x-3, y-3, x+3, y+3], fill=(59, 130, 246, 255))
        
        # Connection lines
        connections = [
            ((-30, -40), (0, -20)),
            ((30, -40), (0, -20)),
            ((0, -20), (-20, 10)),
            ((0, -20), (20, 10))
        ]
        for (x1, y1), (x2, y2) in connections:
            draw.line([center + x1, center + y1, center + x2, center + y2], 
                     fill=(59, 130, 246, 180), width=2)
        
        # Productivity icons around the brain
        # Task checkmark (top)
        check_center = (center, center - 106)
        draw.ellipse([check_center[0]-12, check_center[1]-12, check_center[0]+12, check_center[1]+12], 
                    fill=(16, 185, 129, 255))
        # Simple checkmark
        draw.line([check_center[0]-4, check_center[1], check_center[0]-1, check_center[1]+3], 
                  fill=(255, 255, 255, 255), width=2)
        draw.line([check_center[0]-1, check_center[1]+3, check_center[0]+4, check_center[1]-3], 
                  fill=(255, 255, 255, 255), width=2)
        
        # Calendar (left)
        cal_center = (center - 106, center)
        draw.rectangle([cal_center[0]-8, cal_center[1]-6, cal_center[0]+8, cal_center[1]+6], 
                      fill=(245, 158, 11, 255))
        draw.rectangle([cal_center[0]-6, cal_center[1]-4, cal_center[0]+6, cal_center[1]+4], 
                      fill=(255, 255, 255, 255))
        
        # Email (right)
        mail_center = (center + 106, center)
        draw.rectangle([mail_center[0]-8, mail_center[1]-5, mail_center[0]+8, mail_center[1]+5], 
                      fill=(239, 68, 68, 255))
        # Simple envelope fold
        draw.polygon([mail_center[0]-8, mail_center[1]-5, mail_center[0], mail_center[1]+2, 
                     mail_center[0]+8, mail_center[1]-5], fill=(255, 255, 255, 255))
        
        # Chat bubble (bottom)
        chat_center = (center, center + 106)
        draw.ellipse([chat_center[0]-10, chat_center[1]-12, chat_center[0]+10, chat_center[1]+8], 
                    fill=(139, 92, 246, 255))
        # Chat dots
        for dx in [-3, 0, 3]:
            draw.ellipse([chat_center[0]+dx-1, chat_center[1]-2-1, chat_center[0]+dx+1, chat_center[1]-2+1], 
                        fill=(255, 255, 255, 255))
        
        # Save the image
        output_path = os.path.join(os.path.dirname(__file__), 'icon.png')
        img.save(output_path, 'PNG')
        print(f"✅ Created icon: {output_path}")
        
        # Also create smaller sizes
        for size in [256, 128, 64, 32, 16]:
            small_img = img.resize((size, size), Image.Resampling.LANCZOS)
            small_path = os.path.join(os.path.dirname(__file__), f'icon-{size}.png')
            small_img.save(small_path, 'PNG')
        
        print("✅ Created additional icon sizes: 16, 32, 64, 128, 256")
        return True
        
    if __name__ == "__main__":
        create_icon()
        
except ImportError:
    print("❌ PIL (Pillow) not available. Please install with: pip install Pillow")
    print("   Or use ImageMagick/rsvg-convert to convert the SVG icon")
    exit(1)
except Exception as e:
    print(f"❌ Error creating icon: {e}")
    exit(1)