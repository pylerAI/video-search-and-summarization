'use client';
"use strict";

exports.__esModule = true;
exports.default = exports.StyleManager = void 0;
/**
 * StyleManager - A utility for managing CSS styles dynamically
 *
 * This manager creates and maintains a single style element in the document head
 * and provides methods to add, update, and remove CSS rules.
 * Supports CSP nonce for Content Security Policy compliance.
 */

// Global style sheet manager
const StyleManager = exports.StyleManager = {
  styleElement: null,
  styleMap: new Map(),
  nonce: undefined,
  /**
   * Initialize the style element if it doesn't exist
   * @param options - Optional configuration options
   * @param options.nonce - CSP nonce to apply to the style element
   * @returns The style element
   */
  init(options) {
    if (!this.styleElement && typeof document !== 'undefined') {
      this.styleElement = document.createElement('style');
      this.styleElement.setAttribute('data-rs-style-manager', '');

      // Apply CSP nonce if provided
      const nonce = (options === null || options === void 0 ? void 0 : options.nonce) || this.nonce;
      if (nonce) {
        this.styleElement.setAttribute('nonce', nonce);
        this.nonce = nonce; // Store for future use
      }
      document.head.appendChild(this.styleElement);
    }
    return this.styleElement;
  },
  /**
   * Set the CSP nonce for the style element
   * @param nonce - CSP nonce value
   */
  setNonce(nonce) {
    this.nonce = nonce;

    // Apply to existing style element if it exists
    if (this.styleElement && nonce) {
      this.styleElement.setAttribute('nonce', nonce);
    }
  },
  /**
   * Add a CSS rule to the style sheet
   * @param selector - CSS selector
   * @param cssText - CSS properties and values
   * @param options - Optional configuration options
   * @param options.nonce - CSP nonce to apply to the style element
   */
  addRule(selector, cssText, options) {
    this.init(options);
    if (!this.styleMap.has(selector) || this.styleMap.get(selector) !== cssText) {
      this.styleMap.set(selector, cssText);
      this.updateStyles();
    }
  },
  /**
   * Remove a CSS rule from the style sheet
   * @param selector - CSS selector to remove
   */
  removeRule(selector) {
    if (this.styleMap.has(selector)) {
      this.styleMap.delete(selector);
      this.updateStyles();
    }
  },
  /**
   * Update the style element with all current rules
   */
  updateStyles() {
    if (!this.styleElement) return;
    let cssText = '';
    this.styleMap.forEach((rules, selector) => {
      cssText += `${selector} { ${rules} }\n`;
    });
    this.styleElement.textContent = cssText;
  },
  /**
   * Clear all rules from the style sheet
   */
  clearRules() {
    this.styleMap.clear();
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
  }
};
var _default = exports.default = StyleManager;