/**
 * Web Accessibility Widget
 * 
 * A configurable widget that enhances website accessibility
 * for users with various disabilities and accessibility needs.
 */

(function(window, document) {
  'use strict';

  // Prevent multiple instantiations
  if (window.AccessibilityTool) {
    console.warn('Accessibility Tool is already loaded on this page.');
    return;
  }

  /**
   * Core AccessibilityTool class
   */
  class AccessibilityTool {
    constructor(config = {}) {
      // Default configuration
      this.config = {
        apiKey: null,
        theme: 'auto', // 'light', 'dark', or 'auto'
        position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        features: {
          contrast: true,
          fontSize: true,
          readingGuide: true,
          textToSpeech: true,
          keyboardNavigation: true
        },
        icons: {
          main: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
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
        },
        ...config
      };

      // User preferences (persisted in localStorage)
      this.preferences = this.loadPreferences();

      // State variables
      this.isOpen = false;
      this.isInitialized = false;
      this.activeFeatures = {};
      
      // Initialize the widget
      this.init();
    }

    /**
     * Initialize the accessibility widget
     */
    init() {
      if (this.isInitialized) return;

      // Verify API key and validate configuration
      if (!this.config.apiKey) {
        console.error('AccessibilityTool: API key is required');
        return;
      }

      // Create the UI elements
      this.createWidgetElements();
      
      // Apply any saved preferences
      this.applyPreferences();
      
      // Register event listeners
      this.registerEventListeners();
      
      // Track initialization
      this.trackEvent('SCRIPT_LOADED');
      
      this.isInitialized = true;
    }

    /**
     * Create widget UI elements
     */
    createWidgetElements() {
      // Main container
      this.container = document.createElement('div');
      this.container.className = `accessibility-widget ${this.config.position}`;
      this.container.setAttribute('aria-hidden', 'true');
      
      // Toggle button
      this.toggleButton = document.createElement('button');
      this.toggleButton.className = 'accessibility-widget-toggle';
      this.toggleButton.setAttribute('aria-label', this.config.labels.buttonTitle);
      this.toggleButton.setAttribute('title', this.config.labels.buttonTitle);
      this.toggleButton.innerHTML = this.config.icons.main;
      
      // Menu panel
      this.menuPanel = document.createElement('div');
      this.menuPanel.className = 'accessibility-widget-menu';
      this.menuPanel.setAttribute('role', 'dialog');
      this.menuPanel.setAttribute('aria-labelledby', 'accessibility-menu-title');
      this.menuPanel.setAttribute('aria-hidden', 'true');
      
      // Menu header
      const header = document.createElement('div');
      header.className = 'accessibility-widget-header';
      
      const title = document.createElement('h2');
      title.id = 'accessibility-menu-title';
      title.textContent = this.config.labels.menuTitle;
      
      const closeButton = document.createElement('button');
      closeButton.className = 'accessibility-widget-close';
      closeButton.setAttribute('aria-label', this.config.labels.closeMenu);
      closeButton.innerHTML = '&times;';
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      // Menu content - add feature controls
      const content = document.createElement('div');
      content.className = 'accessibility-widget-content';
      
      // Add feature controls based on config
      if (this.config.features.contrast) {
        content.appendChild(this.createContrastControl());
      }
      
      if (this.config.features.fontSize) {
        content.appendChild(this.createFontSizeControl());
      }
      
      if (this.config.features.readingGuide) {
        content.appendChild(this.createReadingGuideControl());
      }
      
      if (this.config.features.textToSpeech) {
        content.appendChild(this.createTextToSpeechControl());
      }
      
      if (this.config.features.keyboardNavigation) {
        content.appendChild(this.createKeyboardNavigationControl());
      }
      
      // Assemble the menu
      this.menuPanel.appendChild(header);
      this.menuPanel.appendChild(content);
      
      // Add everything to the container
      this.container.appendChild(this.toggleButton);
      this.container.appendChild(this.menuPanel);
      
      // Add to the document
      document.body.appendChild(this.container);
      
      // Add stylesheet
      this.addStyles();
    }
    
    /**
     * Create contrast control
     */
    createContrastControl() {
      const control = document.createElement('div');
      control.className = 'accessibility-control';
      
      const label = document.createElement('span');
      label.textContent = this.config.labels.contrast;
      
      const buttons = document.createElement('div');
      buttons.className = 'button-group';
      
      const options = [
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High Contrast' },
        { value: 'invert', label: 'Inverted' }
      ];
      
      options.forEach(option => {
        const button = document.createElement('button');
        button.setAttribute('data-value', option.value);
        button.setAttribute('aria-pressed', 
          this.preferences.contrast === option.value ? 'true' : 'false');
        button.textContent = option.label;
        button.addEventListener('click', () => this.setContrast(option.value));
        buttons.appendChild(button);
      });
      
      control.appendChild(label);
      control.appendChild(buttons);
      
      return control;
    }
    
    /**
     * Create font size control
     */
    createFontSizeControl() {
      const control = document.createElement('div');
      control.className = 'accessibility-control';
      
      const label = document.createElement('span');
      label.textContent = this.config.labels.fontSize;
      
      const buttons = document.createElement('div');
      buttons.className = 'button-group';
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.textContent = 'A-';
      decreaseBtn.addEventListener('click', () => this.adjustFontSize(-1));
      
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset';
      resetBtn.addEventListener('click', () => this.adjustFontSize(0));
      
      const increaseBtn = document.createElement('button');
      increaseBtn.textContent = 'A+';
      increaseBtn.addEventListener('click', () => this.adjustFontSize(1));
      
      buttons.appendChild(decreaseBtn);
      buttons.appendChild(resetBtn);
      buttons.appendChild(increaseBtn);
      
      control.appendChild(label);
      control.appendChild(buttons);
      
      return control;
    }
    
    /**
     * Create reading guide control
     */
    createReadingGuideControl() {
      const control = document.createElement('div');
      control.className = 'accessibility-control';
      
      const label = document.createElement('span');
      label.textContent = this.config.labels.readingGuide;
      
      const toggle = document.createElement('button');
      toggle.className = 'toggle-button';
      toggle.setAttribute('aria-pressed', 
        this.preferences.readingGuide ? 'true' : 'false');
      toggle.textContent = this.preferences.readingGuide ? 'On' : 'Off';
      toggle.addEventListener('click', () => this.toggleReadingGuide());
      
      control.appendChild(label);
      control.appendChild(toggle);
      
      return control;
    }
    
    /**
     * Create text-to-speech control
     */
    createTextToSpeechControl() {
      const control = document.createElement('div');
      control.className = 'accessibility-control';
      
      const label = document.createElement('span');
      label.textContent = this.config.labels.textToSpeech;
      
      const toggle = document.createElement('button');
      toggle.className = 'toggle-button';
      toggle.setAttribute('aria-pressed', 
        this.preferences.textToSpeech ? 'true' : 'false');
      toggle.textContent = this.preferences.textToSpeech ? 'On' : 'Off';
      toggle.addEventListener('click', () => this.toggleTextToSpeech());
      
      control.appendChild(label);
      control.appendChild(toggle);
      
      return control;
    }
    
    /**
     * Create keyboard navigation control
     */
    createKeyboardNavigationControl() {
      const control = document.createElement('div');
      control.className = 'accessibility-control';
      
      const label = document.createElement('span');
      label.textContent = this.config.labels.keyboardNavigation;
      
      const toggle = document.createElement('button');
      toggle.className = 'toggle-button';
      toggle.setAttribute('aria-pressed', 
        this.preferences.keyboardNavigation ? 'true' : 'false');
      toggle.textContent = this.preferences.keyboardNavigation ? 'On' : 'Off';
      toggle.addEventListener('click', () => this.toggleKeyboardNavigation());
      
      control.appendChild(label);
      control.appendChild(toggle);
      
      return control;
    }
    
    /**
     * Add CSS styles for the widget
     */
    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .accessibility-widget {
          position: fixed;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .accessibility-widget.top-left {
          top: 20px;
          left: 20px;
        }
        
        .accessibility-widget.top-right {
          top: 20px;
          right: 20px;
        }
        
        .accessibility-widget.bottom-left {
          bottom: 20px;
          left: 20px;
        }
        
        .accessibility-widget.bottom-right {
          bottom: 20px;
          right: 20px;
        }
        
        .accessibility-widget-toggle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #4f46e5;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: background-color 0.2s;
        }
        
        .accessibility-widget-toggle:hover {
          background-color: #4338ca;
        }
        
        .accessibility-widget-toggle:focus {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }
        
        .accessibility-widget-menu {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 300px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: none;
        }
        
        .accessibility-widget-menu.open {
          display: block;
        }
        
        .accessibility-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #4f46e5;
          color: white;
        }
        
        .accessibility-widget-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        
        .accessibility-widget-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
        }
        
        .accessibility-widget-content {
          padding: 16px;
        }
        
        .accessibility-control {
          margin-bottom: 16px;
        }
        
        .accessibility-control:last-child {
          margin-bottom: 0;
        }
        
        .accessibility-control span {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .button-group {
          display: flex;
          gap: 8px;
        }
        
        .button-group button {
          flex: 1;
          padding: 6px 8px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .button-group button[aria-pressed="true"] {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .toggle-button {
          padding: 6px 12px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .toggle-button[aria-pressed="true"] {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        /* Reading guide styles */
        .accessibility-reading-guide {
          position: fixed;
          left: 0;
          right: 0;
          height: 30px;
          background-color: rgba(255, 255, 0, 0.2);
          pointer-events: none;
          z-index: 9998;
          display: none;
        }
        
        /* High contrast mode */
        body.high-contrast {
          background-color: black !important;
          color: white !important;
        }
        
        body.high-contrast * {
          background-color: black !important;
          color: white !important;
          border-color: white !important;
        }
        
        body.high-contrast a {
          color: yellow !important;
        }
        
        body.high-contrast button, 
        body.high-contrast input, 
        body.high-contrast textarea, 
        body.high-contrast select {
          background-color: black !important;
          color: white !important;
          border: 1px solid white !important;
        }
        
        /* Inverted colors */
        body.inverted {
          filter: invert(100%) hue-rotate(180deg);
        }
        
        body.inverted img,
        body.inverted video {
          filter: invert(100%) hue-rotate(180deg);
        }
        
        /* Font size adjustments */
        body.font-size-1 * { font-size: 110% !important; }
        body.font-size-2 * { font-size: 120% !important; }
        body.font-size-3 * { font-size: 130% !important; }
        body.font-size-4 * { font-size: 140% !important; }
        body.font-size-5 * { font-size: 150% !important; }
      `;
      
      document.head.appendChild(style);
    }
    
    /**
     * Register event listeners
     */
    registerEventListeners() {
      // Toggle button click
      this.toggleButton.addEventListener('click', () => this.toggleMenu());
      
      // Close button click
      this.menuPanel.querySelector('.accessibility-widget-close')
        .addEventListener('click', () => this.closeMenu());
      
      // Close when clicking outside the widget
      document.addEventListener('click', (event) => {
        if (this.isOpen && !this.container.contains(event.target)) {
          this.closeMenu();
        }
      });
      
      // Reading guide mouse tracking
      if (this.config.features.readingGuide) {
        document.addEventListener('mousemove', (event) => {
          if (this.activeFeatures.readingGuide) {
            const guide = document.querySelector('.accessibility-reading-guide');
            if (guide) {
              guide.style.top = `${event.clientY - 15}px`;
            }
          }
        });
      }
      
      // Keyboard shortcuts
      document.addEventListener('keydown', (event) => {
        // Alt+A to toggle the menu
        if (event.altKey && event.key === 'a') {
          event.preventDefault();
          this.toggleMenu();
        }
      });
    }
    
    /**
     * Toggle the menu open/closed
     */
    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }
    
    /**
     * Open the accessibility menu
     */
    openMenu() {
      this.menuPanel.classList.add('open');
      this.menuPanel.setAttribute('aria-hidden', 'false');
      this.container.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
      this.trackEvent('FEATURE_USED', { feature: 'menu_opened' });
    }
    
    /**
     * Close the accessibility menu
     */
    closeMenu() {
      this.menuPanel.classList.remove('open');
      this.menuPanel.setAttribute('aria-hidden', 'true');
      this.container.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
    }
    
    /**
     * Set contrast mode
     */
    setContrast(mode) {
      // Remove any existing contrast classes
      document.body.classList.remove('high-contrast', 'inverted');
      
      // Apply the selected mode
      if (mode === 'high') {
        document.body.classList.add('high-contrast');
      } else if (mode === 'invert') {
        document.body.classList.add('inverted');
      }
      
      // Update buttons
      const buttons = this.menuPanel.querySelectorAll('[data-value]');
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', button.getAttribute('data-value') === mode ? 'true' : 'false');
      });
      
      // Save preference
      this.preferences.contrast = mode;
      this.savePreferences();
      
      this.trackEvent('FEATURE_USED', { feature: 'contrast', setting: mode });
    }
    
    /**
     * Adjust font size
     */
    adjustFontSize(direction) {
      // Current font size level
      let currentLevel = this.preferences.fontSize || 0;
      
      // Apply the adjustment
      if (direction === 0) {
        // Reset
        currentLevel = 0;
      } else {
        // Increase or decrease
        currentLevel = Math.max(0, Math.min(5, currentLevel + direction));
      }
      
      // Remove any existing font size classes
      for (let i = 1; i <= 5; i++) {
        document.body.classList.remove(`font-size-${i}`);
      }
      
      // Apply new font size class if not at level 0
      if (currentLevel > 0) {
        document.body.classList.add(`font-size-${currentLevel}`);
      }
      
      // Save preference
      this.preferences.fontSize = currentLevel;
      this.savePreferences();
      
      this.trackEvent('FEATURE_USED', { feature: 'font_size', level: currentLevel });
    }
    
    /**
     * Toggle reading guide
     */
    toggleReadingGuide() {
      this.preferences.readingGuide = !this.preferences.readingGuide;
      this.savePreferences();
      
      const toggle = this.menuPanel.querySelector(`[aria-pressed][title="${this.config.labels.readingGuide}"]`);
      if (toggle) {
        toggle.setAttribute('aria-pressed', this.preferences.readingGuide ? 'true' : 'false');
        toggle.textContent = this.preferences.readingGuide ? 'On' : 'Off';
      }
      
      if (this.preferences.readingGuide) {
        this.enableReadingGuide();
      } else {
        this.disableReadingGuide();
      }
      
      this.trackEvent('FEATURE_USED', { feature: 'reading_guide', enabled: this.preferences.readingGuide });
    }
    
    /**
     * Enable reading guide
     */
    enableReadingGuide() {
      // Create reading guide element if it doesn't exist
      let guide = document.querySelector('.accessibility-reading-guide');
      if (!guide) {
        guide = document.createElement('div');
        guide.className = 'accessibility-reading-guide';
        document.body.appendChild(guide);
      }
      
      guide.style.display = 'block';
      this.activeFeatures.readingGuide = true;
    }
    
    /**
     * Disable reading guide
     */
    disableReadingGuide() {
      const guide = document.querySelector('.accessibility-reading-guide');
      if (guide) {
        guide.style.display = 'none';
      }
      this.activeFeatures.readingGuide = false;
    }
    
    /**
     * Toggle text-to-speech
     */
    toggleTextToSpeech() {
      this.preferences.textToSpeech = !this.preferences.textToSpeech;
      this.savePreferences();
      
      const toggle = this.menuPanel.querySelector(`[aria-pressed][title="${this.config.labels.textToSpeech}"]`);
      if (toggle) {
        toggle.setAttribute('aria-pressed', this.preferences.textToSpeech ? 'true' : 'false');
        toggle.textContent = this.preferences.textToSpeech ? 'On' : 'Off';
      }
      
      if (this.preferences.textToSpeech) {
        this.enableTextToSpeech();
      } else {
        this.disableTextToSpeech();
      }
      
      this.trackEvent('FEATURE_USED', { feature: 'text_to_speech', enabled: this.preferences.textToSpeech });
    }
    
    /**
     * Enable text-to-speech
     */
    enableTextToSpeech() {
      // Add click event to paragraphs and headings
      document.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(element => {
        element.style.cursor = 'pointer';
        element.dataset.ttsEnabled = 'true';
        
        if (!element.dataset.ttsListener) {
          element.dataset.ttsListener = 'true';
          element.addEventListener('click', () => {
            if (this.activeFeatures.textToSpeech) {
              this.speakText(element.textContent);
            }
          });
        }
      });
      
      this.activeFeatures.textToSpeech = true;
    }
    
    /**
     * Disable text-to-speech
     */
    disableTextToSpeech() {
      // Remove styling from elements
      document.querySelectorAll('[data-tts-enabled="true"]').forEach(element => {
        element.style.cursor = '';
        element.dataset.ttsEnabled = 'false';
      });
      
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      this.activeFeatures.textToSpeech = false;
    }
    
    /**
     * Speak text using the Web Speech API
     */
    speakText(text) {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use default voice
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          utterance.voice = voices[0];
        }
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Text-to-speech is not supported in this browser');
      }
    }
    
    /**
     * Toggle keyboard navigation
     */
    toggleKeyboardNavigation() {
      this.preferences.keyboardNavigation = !this.preferences.keyboardNavigation;
      this.savePreferences();
      
      const toggle = this.menuPanel.querySelector(`[aria-pressed][title="${this.config.labels.keyboardNavigation}"]`);
      if (toggle) {
        toggle.setAttribute('aria-pressed', this.preferences.keyboardNavigation ? 'true' : 'false');
        toggle.textContent = this.preferences.keyboardNavigation ? 'On' : 'Off';
      }
      
      if (this.preferences.keyboardNavigation) {
        this.enableKeyboardNavigation();
      } else {
        this.disableKeyboardNavigation();
      }
      
      this.trackEvent('FEATURE_USED', { feature: 'keyboard_navigation', enabled: this.preferences.keyboardNavigation });
    }
    
    /**
     * Enable keyboard navigation
     */
    enableKeyboardNavigation() {
      // Add visible focus styles to all focusable elements
      const style = document.createElement('style');
      style.id = 'accessibility-keyboard-styles';
      style.textContent = `
        a:focus, button:focus, input:focus, select:focus, textarea:focus, [tabindex]:focus {
          outline: 3px solid #4f46e5 !important;
          outline-offset: 2px !important;
        }
      `;
      document.head.appendChild(style);
      
      this.activeFeatures.keyboardNavigation = true;
    }
    
    /**
     * Disable keyboard navigation
     */
    disableKeyboardNavigation() {
      // Remove keyboard navigation styles
      const style = document.getElementById('accessibility-keyboard-styles');
      if (style) {
        style.remove();
      }
      
      this.activeFeatures.keyboardNavigation = false;
    }
    
    /**
     * Load saved preferences from localStorage
     */
    loadPreferences() {
      const saved = localStorage.getItem('accessibility-preferences');
      
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved accessibility preferences', e);
        }
      }
      
      // Default preferences
      return {
        contrast: 'normal',
        fontSize: 0,
        readingGuide: false,
        textToSpeech: false,
        keyboardNavigation: false
      };
    }
    
    /**
     * Save preferences to localStorage
     */
    savePreferences() {
      try {
        localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
      } catch (e) {
        console.error('Failed to save accessibility preferences', e);
      }
    }
    
    /**
     * Apply saved preferences
     */
    applyPreferences() {
      // Apply contrast
      if (this.preferences.contrast && this.preferences.contrast !== 'normal') {
        this.setContrast(this.preferences.contrast);
      }
      
      // Apply font size
      if (this.preferences.fontSize && this.preferences.fontSize > 0) {
        this.adjustFontSize(0); // Reset first
        document.body.classList.add(`font-size-${this.preferences.fontSize}`);
      }
      
      // Apply reading guide
      if (this.preferences.readingGuide) {
        this.enableReadingGuide();
      }
      
      // Apply text-to-speech
      if (this.preferences.textToSpeech) {
        this.enableTextToSpeech();
      }
      
      // Apply keyboard navigation
      if (this.preferences.keyboardNavigation) {
        this.enableKeyboardNavigation();
      }
    }
    
    /**
     * Track an event
     */
    trackEvent(eventType, details = {}) {
      // Skip if no API key
      if (!this.config.apiKey) return;
      
      // Prepare data
      const data = {
        apiKey: this.config.apiKey,
        eventType,
        pageUrl: window.location.href,
        eventData: details
      };
      
      // Send to the API
      fetch('https://accessibility-tool.example.com/api/v1/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        // Use keepalive to ensure the request completes even if page is unloading
        keepalive: true
      }).catch(error => {
        console.error('Failed to track accessibility event', error);
      });
    }
    
    /**
     * Set user preferences programmatically
     */
    setPreferences(preferences = {}) {
      // Update preferences object
      this.preferences = {
        ...this.preferences,
        ...preferences
      };
      
      // Apply new preferences
      this.applyPreferences();
      
      // Save to localStorage
      this.savePreferences();
      
      this.trackEvent('USER_PREFERENCE', { preferences: this.preferences });
    }
  }
  
  // Initialize global API
  window.AccessibilityTool = {
    init: function(config) {
      window._accessibilityToolInstance = new AccessibilityTool(config);
      return this;
    },
    open: function() {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.openMenu();
      }
      return this;
    },
    close: function() {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.closeMenu();
      }
      return this;
    },
    setContrast: function(mode) {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.setContrast(mode);
      }
      return this;
    },
    adjustFontSize: function(direction) {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.adjustFontSize(direction);
      }
      return this;
    },
    enableReadingGuide: function() {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.enableReadingGuide();
        window._accessibilityToolInstance.preferences.readingGuide = true;
        window._accessibilityToolInstance.savePreferences();
      }
      return this;
    },
    setPreferences: function(preferences) {
      if (window._accessibilityToolInstance) {
        window._accessibilityToolInstance.setPreferences(preferences);
      }
      return this;
    }
  };
})(window, document);
