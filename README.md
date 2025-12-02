# VisBug - Visual Development Tools

A powerful browser extension that provides visual development tools for web developers and designers. Inspect elements, visualize spacing, pick colors, analyze fonts, and navigate the DOM hierarchy with an intuitive visual interface.

![VisBug Logo](icons/icon.svg)

## Features

### 🔍 Inspect Element
- Click any element to see detailed CSS properties
- View computed dimensions, margins, padding
- See how width/height are calculated (flex, grid, auto, etc.)
- Understand position and layout properties

### 📐 Spacing & Dimensions
- Hover over elements to see real-time dimensions
- Visualize margins (orange) and padding (green)
- See exact pixel measurements
- Understand box model at a glance

### 🎨 Color Picker
- Click any element to copy its color
- Quickly grab colors from any website
- Colors automatically copied to clipboard

### 🔤 Font Inspector
- Click to see font family, size, and weight
- Perfect for matching typography

### 🌳 Element Navigator (Hierarchy Panel)
- Navigate the DOM tree visually
- See parent and sibling elements
- Expand/collapse children
- Click to jump between elements
- Hover to highlight on page

## Installation

### Chrome, Edge, Brave, Arc (Chromium-based browsers)

#### Step 1: Generate Icons (Required)

Before installing, you need to create the extension icons:

1. Open `icons/generate-icons.html` in your web browser:
   ```bash
   # macOS
   open icons/generate-icons.html

   # Windows
   start icons/generate-icons.html

   # Linux
   xdg-open icons/generate-icons.html
   ```

2. Click each download button to save the icons:
   - Download 16x16 → Save as `icon16.png` in the `icons/` folder
   - Download 32x32 → Save as `icon32.png` in the `icons/` folder
   - Download 48x48 → Save as `icon48.png` in the `icons/` folder
   - Download 128x128 → Save as `icon128.png` in the `icons/` folder

3. **Alternative**: If you have ImageMagick installed:
   ```bash
   cd icons
   convert -background none icon.svg -resize 16x16 icon16.png
   convert -background none icon.svg -resize 32x32 icon32.png
   convert -background none icon.svg -resize 48x48 icon48.png
   convert -background none icon.svg -resize 128x128 icon128.png
   ```

#### Step 2: Install the Extension

1. **Open Extension Management Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`
   - Arc: Navigate to `arc://extensions/`

2. **Enable Developer Mode**
   - Find the "Developer mode" toggle in the top-right corner
   - Turn it ON

3. **Load the Extension**
   - Click the "Load unpacked" button (top-left)
   - Browse to and select the `devtools-extension` folder
   - Click "Select" or "Open"

4. **Verify Installation**
   - The VisBug icon should appear in your browser toolbar
   - If you don't see it, click the puzzle piece icon and pin VisBug

#### Step 3: Test It Out

1. Visit any website (try the included `test-page.html`)
2. Click the VisBug icon in your toolbar
3. Click "Activate VisBug"
4. The toolbar should appear at the top of the page
5. Try clicking elements with the Inspect tool!

### Firefox (Alternative method)

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file
4. Note: Firefox temporary add-ons are removed when you close the browser

## Usage

### Activation

**Method 1: Extension Popup**
1. Click the VisBug icon in your browser toolbar
2. Click "Activate VisBug"
3. The toolbar will appear at the top of the page

**Method 2: Keyboard Shortcut**
- Windows/Linux: `Ctrl + Shift + V`
- Mac: `⌘ + Shift + V`

### Tools

Once activated, you'll see a toolbar with 4 tools:

1. **🔍 Inspect** - Click elements to see properties and navigate hierarchy
2. **📐 Spacing** - Hover to see dimensions, margins, and padding
3. **🎨 Color** - Click to copy colors to clipboard
4. **🔤 Font** - Click to see font information

### Element Navigator

When you click an element in Inspect mode, the Element Navigator panel appears:
- **Parent element** - Click to navigate up the tree
- **Current siblings** - See all elements at the same level
- **Children** - Click arrows to expand/collapse
- **Hover highlighting** - Hover over items to highlight them on the page

### Deactivation

- Click the **✕** button in the toolbar
- Or use the keyboard shortcut again
- Or click "Deactivate" in the extension popup

## Development

### File Structure

```
devtools-extension/
├── manifest.json         # Extension configuration
├── visbug.js            # Main VisBug tool (injected into pages)
├── background.js        # Background service worker
├── content.js           # Content script (keyboard shortcuts)
├── popup.html           # Extension popup UI
├── popup.js             # Popup functionality
├── icons/               # Extension icons
│   ├── icon.svg         # Source SVG icon
│   ├── icon16.png       # 16x16 toolbar icon
│   ├── icon32.png       # 32x32 icon
│   ├── icon48.png       # 48x48 icon
│   ├── icon128.png      # 128x128 Chrome Web Store icon
│   └── generate-icons.html  # Icon generator tool
└── README.md            # This file
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the VisBug extension
4. Reload any open pages to see changes

### Customization

**Change Colors:**
Edit the color values in `visbug.js`:
- Toolbar background: `#1a1a1a`
- Active tool color: `#78E2FF`
- Highlight color: `#FF8A95`

**Add New Tools:**
Add a new tool object to the `tools` array in `visbug.js` and implement its functionality.

**Modify Keyboard Shortcut:**
Edit the key combination in `content.js` (line with `e.key === 'V'`).

## Keyboard Shortcuts

- `Ctrl/⌘ + Shift + V` - Toggle VisBug on/off
- `Esc` - Close hierarchy panel (when VisBug is active)

## Browser Compatibility

- ✅ Chrome (v88+)
- ✅ Edge (v88+)
- ✅ Brave
- ✅ Arc
- ✅ Opera
- ✅ Vivaldi
- ⚠️ Firefox (requires minor manifest modifications)
- ⚠️ Safari (requires different approach)

## Privacy

VisBug:
- Does NOT collect any data
- Does NOT send information to external servers
- Runs entirely locally in your browser
- Only accesses the current tab when activated
- Does NOT track your browsing history

## Known Limitations

- Cannot inspect browser UI elements (address bar, tabs, etc.)
- May not work on some protected pages (browser settings, Chrome Web Store)
- Some CSP-strict websites may block the tool
- Requires page reload if activated before page loads completely

## Troubleshooting

**Extension doesn't activate:**
- Check if you're on a protected page (browser settings, etc.)
- Try reloading the page
- Check browser console for errors

**Toolbar not visible:**
- Make sure you clicked "Activate" in the popup
- Check if the page has a high z-index element covering it
- Try zooming out (`Ctrl/⌘ + -`)

**Hierarchy panel empty:**
- Make sure you clicked an element (not empty space)
- Some elements may not have visible children
- Try clicking a different element

**Icons not showing:**
- Generate the PNG icons using `icons/generate-icons.html`
- Make sure they're saved in the `icons/` folder
- Reload the extension in `chrome://extensions/`

## Credits

Extracted and adapted from the [Differ](https://github.com/sky-valley/differ1) macOS application's visual preview feature.

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

This is a standalone extraction of VisBug from the Differ app. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Fork and customize for your needs

## Future Enhancements

Potential features to add:
- [ ] Grid overlay
- [ ] Alignment guides
- [ ] Screenshot tool
- [ ] CSS export
- [ ] Accessibility checker
- [ ] Responsive breakpoint viewer
- [ ] Design token extraction
- [ ] Color palette generator

---

**Made with ❤️ by the Differ team**
