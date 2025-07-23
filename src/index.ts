/**
 * @pricepatrol/parser
 * 
 * A comprehensive structured data parsing library for the Price Patrol ecosystem.
 * Supports both browser and Node.js environments with separate exports for
 * browser-specific DOM extraction and universal data processing.
 * 
 * @version 1.0.0
 */

// Export all types
export * from './types.js';

// Export core processing functionality (works everywhere)
export {
  StructuredDataProcessor,
  evaluateStructuredDataPath,
  STRUCTURED_DATA_VERSION
} from './processing.js';

// Export browser functionality (browser/JSDOM only)
export {
  BrowserDataExtractor,
  createBrowserExtractor,
  extractJsonLdData,
  extractMetaTags,
  extractDataLayers,
  extractMicrodata
} from './browser.js';

// Version constant
export const VERSION = '1.0.0';