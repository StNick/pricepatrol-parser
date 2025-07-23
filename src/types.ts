/**
 * Type definitions for structured data processing
 */

export interface StructuredDataPayload {
  version?: string;
  jsonLd: any[];
  metaTags: Record<string, string>;
  dataLayers: Record<string, any>;
  microdata?: any[];
  customDataLayers?: Record<string, any>;
  url: string;
  pageTitle: string;
  timestamp: string;
  extractorVersion: string;
}

export interface ExtractorCapabilities {
  jsonLd: boolean;
  metaTags: boolean;
  dataLayers: boolean;
  microdata?: boolean;
  customDataLayers?: boolean;
}

export interface FieldSelector {
  jsonLd?: string;
  metaTags?: string;
  dataLayers?: string;
  microdata?: string;
  customDataLayers?: string;
  regex?: string;
  transformations?: FieldTransformation[];
}

export interface FieldTransformation {
  type: 'regex' | 'replace' | 'trim' | 'lowercase' | 'uppercase' | 'parseNumber' | 'parseBoolean';
  pattern?: string;
  replacement?: string;
  flags?: string;
}

export interface ExtractedField {
  value: string | number | boolean | null;
  source: 'jsonLd' | 'metaTags' | 'dataLayers' | 'microdata' | 'customDataLayers';
  path: string;
  confidence: number; // 0-1 based on extraction method reliability
}

export interface ProductData {
  productName?: ExtractedField;
  price?: ExtractedField;
  salePrice?: ExtractedField;
  currency?: ExtractedField;
  sku?: ExtractedField;
  upc?: ExtractedField;
  model?: ExtractedField;
  description?: ExtractedField;
  brandName?: ExtractedField;
  categoryName?: ExtractedField;
  imageUrl?: ExtractedField;
  inStock?: ExtractedField;
  rating?: ExtractedField;
  reviewCount?: ExtractedField;
  saleStartDate?: ExtractedField;
  saleEndDate?: ExtractedField;
  unitPrice?: ExtractedField;
  unitType?: ExtractedField;
}

export interface StructuredDataSubmission {
  extractorVersion: string;
  url: string;
  timestamp: string;
  source: 'BROWSER_EXTENSION' | 'API' | 'SCRAPER';
  capabilities: ExtractorCapabilities;
  data: StructuredDataPayload;
}