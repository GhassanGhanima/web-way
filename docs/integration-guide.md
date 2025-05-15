# Integration Guide

This guide explains how to integrate the Accessibility Tool into your website.

## Quick Start

1. Sign up for an account at [https://accessibility-tool.example.com](https://accessibility-tool.example.com)
2. Create a new integration in your dashboard
3. Add the script to your website

### Adding the Script

Add the following code to your website's `<head>` section:

```html
<script src="https://accessibility-tool.example.com/api/v1/cdn/loader.js?apiKey=YOUR_API_KEY" async></script>
```

Replace `YOUR_API_KEY` with the API key provided in your dashboard.

## Domain Verification

For security, we verify that you own the domain where you're installing the accessibility tool:

1. Go to your integration settings in the dashboard
2. Copy the verification code
3. Add the verification code to your website in one of these ways:
   - Add a meta tag: `<meta name="accessibility-verification" content="YOUR_VERIFICATION_CODE">`
   - Add a DNS TXT record: `accessibility-verification=YOUR_VERIFICATION_CODE`
   - Upload a verification file to your server: `.well-known/accessibility-verification.txt`

## Configuration Options

You can customize the accessibility tool by adding options to your integration settings:

### Theme

Choose from light, dark, or auto themes:

```json
{
  "theme": "light" // Options: "light", "dark", "auto"
}
```

### Features

Enable or disable specific accessibility features:

```json
{
  "features": {
    "contrast": true,
    "fontSize": true,
    "readingGuide": true,
    "textToSpeech": true,
    "keyboardNavigation": true
  }
}
```

### Position

Set where the accessibility button appears:

```json
{
  "position": "bottom-right" // Options: "top-left", "top-right", "bottom-left", "bottom-right"
}
```

### Languages

Specify supported languages:

```json
{
  "languages": ["en", "fr", "es"]
}
```

## Advanced Integration

### Custom Trigger

You can create a custom button to trigger the accessibility menu:

```html
<button id="custom-accessibility-button">Accessibility Options</button>

<script>
  document.getElementById('custom-accessibility-button').addEventListener('click', function() {
    if (window.AccessibilityTool) {
      window.AccessibilityTool.open();
    }
  });
</script>
```

### JavaScript API

You can programmatically control the accessibility tool:

```javascript
// Open the accessibility menu
window.AccessibilityTool.open();

// Close the accessibility menu
window.AccessibilityTool.close();

// Toggle high contrast mode
window.AccessibilityTool.setContrast(true);

// Increase font size
window.AccessibilityTool.adjustFontSize(1); // 1 = increase, -1 = decrease, 0 = reset

// Enable reading guide
window.AccessibilityTool.enableReadingGuide();

// Set user preferences
window.AccessibilityTool.setPreferences({
  contrast: 'high',
  fontSize: 2,
  readingGuide: true
});
```

## Analytics

The accessibility tool collects anonymous usage data to help you understand how users interact with the accessibility features. View these analytics in your dashboard.

### Privacy Considerations

The accessibility tool is designed with privacy in mind:

- No personally identifiable information is collected
- All data is anonymized
- Only accessibility feature usage is tracked
- No tracking across different websites

## Troubleshooting

### The script doesn't load

- Verify your API key is correct
- Check that your domain is verified
- Ensure your subscription is active

### Features aren't working

- Check browser console for errors
- Verify the features are enabled in your settings
- Test in a different browser

### Script conflicts

If you experience conflicts with other scripts:

```html
<script>
  window.AccessibilityToolConfig = {
    noConflict: true,
    deferInit: true
  };
</script>
<script src="https://accessibility-tool.example.com/api/v1/cdn/loader.js?apiKey=YOUR_API_KEY" async></script>
```

## Support

If you need assistance, contact our support team:

- Email: support@accessibility-tool.example.com
- Help Center: https://help.accessibility-tool.example.com
- Live Chat: Available in your dashboard
