# Icon Generation

You need to create PNG icons in these sizes:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

## Option 1: Use the HTML Generator

1. Open `generate-icons.html` in your browser
2. Click each download button to save the icons
3. Save them in this folder with the correct names

## Option 2: Convert SVG to PNG

Use an online tool or ImageMagick:

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Convert SVG to different sizes
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 32x32 icon32.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

## Option 3: Use Figma/Sketch/Photoshop

1. Import `icon.svg`
2. Export as PNG at each required size
3. Save in this folder

## Temporary Solution

For testing, you can use placeholder images. The extension will still work, it just won't have nice icons in the browser toolbar.
