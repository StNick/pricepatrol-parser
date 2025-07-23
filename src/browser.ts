/**
 * Browser-specific Structured Data Extraction Module
 * Version: 1.0.0
 * 
 * This module provides browser-specific functionality for extracting
 * structured data from DOM elements. It requires a browser environment
 * or JSDOM for testing.
 */

import { StructuredDataPayload, ExtractorCapabilities } from './types.js';

/**
 * Extract JSON-LD data from script tags
 */
export const extractJsonLdData = (document: Document): any[] => {
  const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  
  return jsonLdScripts.map(script => {
    try {
      return JSON.parse(script.textContent || '');
    } catch (e) {
      return { error: 'Invalid JSON', content: script.textContent };
    }
  });
};

/**
 * Extract meta tags data
 */
export const extractMetaTags = (document: Document): Record<string, string> => {
  const metaTags: Record<string, string> = {};
  const metaElements = Array.from(document.querySelectorAll('meta'));
  
  metaElements.forEach(tag => {
    const key = tag.getAttribute('property') || tag.getAttribute('name');
    if (key) {
      metaTags[key] = tag.getAttribute('content') || '';
    }
  });
  
  return metaTags;
};

/**
 * Extract data layers from window object
 */
export const extractDataLayers = (window: any): Record<string, any> => {
  const dataLayers: Record<string, any> = {};
  const commonDataLayerNames = ['dataLayer', 'digitalData', 'utag_data'];
  
  commonDataLayerNames.forEach(name => {
    if (window[name]) {
      dataLayers[name] = window[name];
    }
  });
  
  return dataLayers;
};

/**
 * Extract microdata from the document
 */
export const extractMicrodata = (document: Document): any[] => {
  const microdataElements = Array.from(document.querySelectorAll('[itemscope]'));
  
  return microdataElements.map(element => {
    const item: any = {};
    
    // Get itemtype
    const itemtype = element.getAttribute('itemtype');
    if (itemtype) {
      item['@type'] = itemtype;
    }
    
    // Get properties that are direct children or descendants of this itemscope
    // but not children of nested itemscopes
    const properties = Array.from(element.querySelectorAll('[itemprop]')).filter(prop => {
      // Check if this property belongs to a nested itemscope
      let parent = prop.parentElement;
      while (parent && parent !== element) {
        if (parent.hasAttribute('itemscope') && parent !== element) {
          return false; // This property belongs to a nested itemscope
        }
        parent = parent.parentElement;
      }
      return true; // This property belongs to the current itemscope
    });
    
    properties.forEach(prop => {
      const name = prop.getAttribute('itemprop');
      if (name) {
        let value: string | null = null;
        
        if (prop.hasAttribute('content')) {
          value = prop.getAttribute('content');
        } else if (prop.tagName === 'META') {
          value = prop.getAttribute('content');
        } else if (prop.tagName === 'TIME') {
          value = prop.getAttribute('datetime') || prop.textContent?.trim() || null;
        } else if (prop.tagName === 'IMG') {
          value = prop.getAttribute('src');
        } else if (prop.tagName === 'A') {
          value = prop.getAttribute('href');
        } else {
          value = prop.textContent?.trim() || null;
        }
        
        if (value) {
          item[name] = value;
        }
      }
    });
    
    return item;
  });
};

/**
 * Main browser extraction class
 */
export class BrowserDataExtractor {
  private document: Document;
  private window: any;

  constructor(document: Document, window: any) {
    this.document = document;
    this.window = window;
  }

  /**
   * Extract all structured data from the current page
   */
  extractAll(): StructuredDataPayload {
    const jsonLd = extractJsonLdData(this.document);
    const metaTags = extractMetaTags(this.document);
    const dataLayers = extractDataLayers(this.window);
    const microdata = extractMicrodata(this.document);

    return {
      jsonLd,
      metaTags,
      dataLayers,
      microdata,
      url: this.window.location?.href || '',
      pageTitle: this.document.title || '',
      timestamp: new Date().toISOString(),
      extractorVersion: '1.0.0'
    };
  }

  /**
   * Get extraction capabilities of current environment
   */
  getCapabilities(): ExtractorCapabilities {
    return {
      jsonLd: true,
      metaTags: true,
      dataLayers: true,
      microdata: true,
      customDataLayers: true
    };
  }

  /**
   * Extract structured data with custom selectors
   */
  extractCustomData(selectors: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      try {
        const element = this.document.querySelector(selector);
        if (element) {
          result[key] = element.textContent?.trim() || null;
        }
      } catch (error) {
        // Invalid selector, skip
        continue;
      }
    }

    return result;
  }

  /**
   * Check if current page has structured data
   */
  hasStructuredData(): boolean {
    try {
      if (!this.document || !this.document.querySelectorAll) {
        return false;
      }
      
      const jsonLd = this.document.querySelectorAll('script[type="application/ld+json"]');
      const metaTags = this.document.querySelectorAll('meta[property], meta[name]');
      const microdata = this.document.querySelectorAll('[itemscope]');
      
      const hasDataLayer = this.window && this.window.dataLayer && Array.isArray(this.window.dataLayer) && this.window.dataLayer.length > 0;
      
      const result = jsonLd.length > 0 || metaTags.length > 0 || microdata.length > 0 || hasDataLayer;
      return result;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Convenience function to create extractor from current browser context
 */
export const createBrowserExtractor = (): BrowserDataExtractor => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('Browser environment required. This function must be called in a browser context.');
  }
  
  return new BrowserDataExtractor(document, window);
};