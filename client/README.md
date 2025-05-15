# Accessibility Widget Client

This directory contains the client-side accessibility widget that gets embedded in websites.

## Files

- `src/accessibility-widget.js` - The main widget implementation
- `src/index.html` - A demo page to test the widget

## Development

To test the widget locally:

1. Open `index.html` in a browser
2. Interact with the widget to test functionality

## Building for Production

The widget is designed to be served through our CDN service. To build for production:

```bash
# Install dependencies
npm install

# Build minified version
npm run build
```

This will create:
- `dist/accessibility-widget.min.js` - Minified widget code
- `dist/accessibility-widget.js` - Non-minified code for debugging

## API Reference

The widget exposes a global `AccessibilityTool` object with the following methods:

### Initialization

```javascript
// Initialize with configuration
AccessibilityTool.init({
  apiKey: 'YOUR_API_KEY',
  position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  theme: 'auto', // 'light', 'dark', 'auto'
  features: {
    contrast: true,
    fontSize: true,
    readingGuide: true,
    textToSpeech: true,
    keyboardNavigation: true
  }
});
```

### Menu Control

```javascript
// Open the accessibility menu
AccessibilityTool.open();

// Close the accessibility menu
AccessibilityTool.close();
```

### Feature Control

```javascript
// Set contrast mode ('normal', 'high', 'invert')
AccessibilityTool.setContrast('high');

// Adjust font size (1 = increase, -1 = decrease, 0 = reset)
AccessibilityTool.adjustFontSize(1);

// Enable reading guide
AccessibilityTool.enableReadingGuide();

// Set all preferences at once
AccessibilityTool.setPreferences({
  contrast: 'high',
  fontSize: 2,
  readingGuide: true,
  textToSpeech: true,
  keyboardNavigation: true
});
```

## Customization

The widget's appearance and behavior can be customized via the configuration object:

```javascript
AccessibilityTool.init({
  // Required
  apiKey: 'YOUR_API_KEY',
  
  // Optional customizations
  position: 'bottom-right',
  theme: 'auto',
  features: {
    contrast: true,
    fontSize: true,
    readingGuide: true,
    textToSpeech: true,
    keyboardNavigation: true
  },
  icons: {
    main: '<svg>...</svg>'
  },
  labels: {
    buttonTitle: 'Accessibility Options',
    menuTitle: 'Accessibility Menu',
    closeMenu: 'Close Menu',
    contrast: 'Contrast',
    fontSize: 'Font Size',
    readingGuide: 'Reading Guide',
    textToSpeech: 'Text to Speech',
    keyboardNavigation: 'Keyboard Navigation'
  }
});
```

## Browser Compatibility

The widget is compatible with modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11 (with polyfills)

## Integration with Backend

The widget automatically tracks usage by sending analytics events to the backend API. These events help administrators understand how users interact with accessibility features on their websites.
