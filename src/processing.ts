/**
 * Structured Data Processing Module
 * Version: 1.0.0
 * 
 * This module provides core structured data processing functionality
 * that works in both browser and Node.js environments.
 */

import {
  StructuredDataPayload,
  FieldSelector,
  ExtractedField,
  ProductData,
  FieldTransformation
} from './types.js';

export const STRUCTURED_DATA_VERSION = "1.0.0";

/**
 * Enhanced path evaluation with better error handling and type safety
 */
export const evaluateStructuredDataPath = (obj: any, path: string): string | null => {
  try {
    if (!obj || !path) {
      return null;
    }

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (part.includes('[') && part.includes(']')) {
        // Handle array indexing like "jsonLd[0]", "image[0]", or consecutive indices like "jsonLd[0][1]"
        const bracketStart = part.indexOf('[');
        const propertyName = part.substring(0, bracketStart);
        const indexPart = part.substring(bracketStart);
        
        // Extract all array indices using regex
        const indexMatches = indexPart.matchAll(/\[(\d+)\]/g);
        const indices = Array.from(indexMatches, match => parseInt(match[1], 10));
        
        if (indices.length === 0) {
          return null;
        }
        
        // Start with the property (if it exists)
        if (propertyName) {
          current = current[propertyName];
          if (current === undefined || current === null) {
            return null;
          }
        }
        
        // Apply each array index in sequence
        for (const index of indices) {
          if (Array.isArray(current)) {
            current = current[index];
            if (current === undefined || current === null) {
              return null;
            }
          } else {
            return null;
          }
        }
      } else {
        // Simple property access - handles properties with colons like "og:description"
        current = current[part];
      }

      if (current === undefined || current === null) {
        return null;
      }
    }

    // Convert to string but preserve null for truly missing values
    return current !== null && current !== undefined ? String(current) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Main class for processing structured data
 */
export class StructuredDataProcessor {
  private readonly version: string;

  constructor(version: string = STRUCTURED_DATA_VERSION) {
    this.version = version;
  }

  /**
   * Process a recipe selector against structured data
   */
  processSelector(data: StructuredDataPayload, selector: FieldSelector): ExtractedField | null {
    // Try each extraction method in order of preference
    const methods = [
      { key: 'jsonLd' as const, source: 'jsonLd' as const, confidence: 0.9 },
      { key: 'metaTags' as const, source: 'metaTags' as const, confidence: 0.8 },
      { key: 'dataLayers' as const, source: 'dataLayers' as const, confidence: 0.7 },
      { key: 'microdata' as const, source: 'microdata' as const, confidence: 0.6 },
      { key: 'customDataLayers' as const, source: 'customDataLayers' as const, confidence: 0.5 }
    ];

    for (const method of methods) {
      if (selector[method.key] && data[method.source]) {
        const result = this.extractFromSource(data[method.source], selector[method.key]!);
        if (result !== null && result !== 'Not found') {
          let processedValue = this.applyTransformations(result, selector.transformations);
          
          // Apply regex if specified
          if (selector.regex && typeof processedValue === 'string') {
            const match = processedValue.match(new RegExp(selector.regex));
            if (match) {
              processedValue = match[1] || match[0];
            }
          }

          return {
            value: processedValue,
            source: method.source,
            path: selector[method.key]!,
            confidence: method.confidence
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract multiple fields from structured data using selectors
   */
  processRecipe(data: StructuredDataPayload, selectors: Record<string, FieldSelector>): ProductData {
    const result: ProductData = {};

    for (const [fieldName, selector] of Object.entries(selectors)) {
      const extracted = this.processSelector(data, selector);
      if (extracted) {
        (result as any)[fieldName] = extracted;
      }
    }

    return result;
  }

  /**
   * Extract value from a specific source using path notation
   */
  private extractFromSource(source: any, path: string): string | null {
    return evaluateStructuredDataPath(source, path);
  }

  /**
   * Apply transformations to extracted values
   */
  private applyTransformations(value: any, transformations?: FieldTransformation[]): any {
    if (!transformations || transformations.length === 0) {
      return value;
    }

    let result = value;

    for (const transform of transformations) {
      switch (transform.type) {
        case 'regex':
          if (transform.pattern && typeof result === 'string') {
            const regex = new RegExp(transform.pattern, transform.flags);
            const match = result.match(regex);
            if (match) {
              result = match[1] || match[0];
            }
          }
          break;

        case 'replace':
          if (transform.pattern && transform.replacement && typeof result === 'string') {
            result = result.replace(new RegExp(transform.pattern, transform.flags), transform.replacement);
          }
          break;

        case 'trim':
          if (typeof result === 'string') {
            result = result.trim();
          }
          break;

        case 'lowercase':
          if (typeof result === 'string') {
            result = result.toLowerCase();
          }
          break;

        case 'uppercase':
          if (typeof result === 'string') {
            result = result.toUpperCase();
          }
          break;

        case 'parseNumber':
          if (typeof result === 'string') {
            const parsed = parseFloat(result.replace(/[^\d.-]/g, ''));
            if (!isNaN(parsed)) {
              result = parsed;
            }
          }
          break;

        case 'parseBoolean':
          if (typeof result === 'string') {
            result = ['true', 'yes', '1', 'on', 'enabled'].includes(result.toLowerCase());
          }
          break;
      }
    }

    return result;
  }

  /**
   * Validate structured data payload
   */
  static validateStructuredData(data: any): data is StructuredDataPayload {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.jsonLd) &&
      typeof data.metaTags === 'object' &&
      typeof data.dataLayers === 'object' &&
      typeof data.url === 'string' &&
      typeof data.pageTitle === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.extractorVersion === 'string'
    );
  }

  /**
   * Get version information
   */
  getVersion(): string {
    return this.version;
  }
}