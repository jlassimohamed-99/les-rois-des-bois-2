# Logo Placement Instructions

## 📍 Where to Place Your Logo

Place your logo image files in this directory (`frontend/public/`) with the filenames:

**Option 1 (Recommended - Theme-aware logos):**
- `logo-light.webp` - Logo for light theme
- `logo-dark.webp` - Logo for dark theme

**Option 2 (Fallback - Single logo):**
- `logo.webp` - Single logo used for both themes (fallback)

## ✅ Supported Formats

- WebP (recommended - excellent quality and smaller file size)
- PNG (fallback if WebP not available)
- SVG (alternative format)

## 🎨 Theme Support

The logo component automatically switches between:
- `logo-light.webp` when in light mode
- `logo-dark.webp` when in dark mode
- `logo.webp` as fallback if themed versions don't exist

## 🎨 Image Requirements

- **Format**: PNG with transparency (recommended)
- **Size**: 512x512px or larger (will be scaled automatically)
- **Background**: Transparent (for best results)
- **Optimization**: Compress for web use

## 🔄 After Adding Logo

1. Place your logo file as `logo.png` in `frontend/public/`
2. The logo will automatically appear throughout the website
3. If logo is not found, an SVG fallback will be displayed

## 📝 Notes

- The logo component is already configured to use `/logo.png`
- The logo adapts automatically to dark/light themes
- All sizes (sm, md, lg, xl) are handled automatically
- Logo is clickable and navigates to home/admin dashboard

