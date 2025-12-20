"""
Script untuk generate PWA icons dalam berbagai ukuran
Memerlukan Pillow: pip install Pillow
"""

from PIL import Image
import os

# Ukuran-ukuran icon yang dibutuhkan untuk PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_pwa_icons(source_image_path, output_dir):
    """
    Generate PWA icons dalam berbagai ukuran dari source image
    
    Args:
        source_image_path: Path ke source image (minimal 512x512)
        output_dir: Directory output untuk icons
    """
    # Pastikan output directory ada
    os.makedirs(output_dir, exist_ok=True)
    
    # Buka source image
    try:
        img = Image.open(source_image_path)
        print(f"✓ Membuka image: {source_image_path}")
        print(f"  Ukuran original: {img.size}")
        
        # Convert ke RGBA jika belum
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Generate setiap ukuran
        for size in SIZES:
            # Resize dengan anti-aliasing untuk kualitas terbaik
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Simpan sebagai PNG
            output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
            resized.save(output_path, 'PNG', optimize=True)
            print(f"✓ Generated: icon-{size}x{size}.png")
        
        print(f"\n✅ Berhasil generate {len(SIZES)} icons!")
        print(f"📁 Output directory: {output_dir}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def create_simple_icon(output_dir):
    """
    Membuat icon sederhana jika tidak ada source image
    """
    os.makedirs(output_dir, exist_ok=True)
    
    for size in SIZES:
        # Buat image dengan gradient merah-orange
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Buat lingkaran merah sebagai placeholder
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        
        # Gradient effect dengan multiple circles
        center = size // 2
        max_radius = size // 2
        
        for i in range(max_radius, 0, -2):
            # Gradient dari orange ke red
            ratio = i / max_radius
            r = int(255 * ratio + 220 * (1 - ratio))
            g = int(69 * ratio + 38 * (1 - ratio))
            b = int(0 * ratio + 38 * (1 - ratio))
            
            draw.ellipse(
                [center - i, center - i, center + i, center + i],
                fill=(r, g, b, 255)
            )
        
        # Tambahkan flame emoji atau text
        # (Untuk simplicity, kita skip text rendering)
        
        output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
        img.save(output_path, 'PNG', optimize=True)
        print(f"✓ Generated: icon-{size}x{size}.png")
    
    print(f"\n✅ Berhasil generate {len(SIZES)} placeholder icons!")
    print(f"📁 Output directory: {output_dir}")

if __name__ == "__main__":
    import sys
    
    # Path ke output directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    output_dir = os.path.join(project_dir, 'public', 'icons')
    
    print("🔥 FireGuard PWA Icon Generator\n")
    
    # Cek apakah ada source image
    if len(sys.argv) > 1:
        source_path = sys.argv[1]
        if os.path.exists(source_path):
            create_pwa_icons(source_path, output_dir)
        else:
            print(f"❌ File tidak ditemukan: {source_path}")
            print("💡 Membuat placeholder icons...")
            create_simple_icon(output_dir)
    else:
        print("💡 Tidak ada source image, membuat placeholder icons...")
        create_simple_icon(output_dir)
        print("\n📝 Untuk menggunakan icon custom:")
        print("   python generate-icons.py path/to/your/icon.png")
