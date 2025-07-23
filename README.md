# @pricepatrol/parser

A comprehensive structured data parsing library for the Price Patrol ecosystem. This library provides robust extraction and processing capabilities for structured data from web pages, including JSON-LD, meta tags, data layers, and microdata.

## Features

- 🚀 **Universal Compatibility**: Works in both browser and Node.js environments
- 🎯 **Multiple Data Sources**: Supports JSON-LD, meta tags, data layers, and microdata
- 🔧 **Flexible Processing**: Advanced path evaluation and data transformations
- 📊 **Confidence Scoring**: Built-in confidence metrics for extraction reliability
- 🧪 **Well Tested**: Comprehensive test suite with 100% coverage
- 📦 **Tree Shakable**: Separate exports for browser and processing functionality

## Installation

```bash
npm install @pricepatrol/parser
```

## Quick Start

### Browser Environment

```typescript
import { createBrowserExtractor, StructuredDataProcessor } from '@pricepatrol/parser';

// Extract data from current page
const extractor = createBrowserExtractor();
const structuredData = extractor.extractAll();

// Process with custom selectors
const processor = new StructuredDataProcessor();
const selectors = {
  productName: { jsonLd: '0.name' },
  price: { jsonLd: '0.offers.price', transformations: [{ type: 'parseNumber' }] },
  brand: { metaTags: 'product:brand' }
};

const result = processor.processRecipe(structuredData, selectors);
console.log(result.productName?.value); // Extracted product name
```

### Node.js Environment

```typescript
import { StructuredDataProcessor } from '@pricepatrol/parser/processing';

const processor = new StructuredDataProcessor();

// Process pre-extracted structured data
const structuredData = {
  jsonLd: [{ "@type": "Product", "name": "Example Product", "offers": { "price": "29.99" } }],
  metaTags: { "og:title": "Example Product Page" },
  dataLayers: { dataLayer: [{ product: { name: "Example" } }] },
  url: "https://example.com/product",
  pageTitle: "Example Product",
  timestamp: new Date().toISOString(),
  extractorVersion: "1.0.0"
};

const result = processor.processSelector(structuredData, {
  jsonLd: '0.name'
});

console.log(result?.value); // "Example Product"
```

## API Reference

### Core Classes

#### `StructuredDataProcessor`

Main processing class for extracting data using selectors.

```typescript
const processor = new StructuredDataProcessor();

// Process single field
const field = processor.processSelector(data, selector);

// Process multiple fields
const results = processor.processRecipe(data, selectors);

// Validate data structure
const isValid = StructuredDataProcessor.validateStructuredData(data);
```

#### `BrowserDataExtractor`

Browser-specific extraction from DOM elements.

```typescript
const extractor = new BrowserDataExtractor(document, window);

// Extract all structured data
const data = extractor.extractAll();

// Check capabilities
const capabilities = extractor.getCapabilities();

// Extract with custom CSS selectors
const customData = extractor.extractCustomData({
  title: 'h1.product-title',
  price: '.price-amount'
});
```

### Selector Format

Selectors define how to extract data from different structured data sources:

```typescript
interface FieldSelector {
  jsonLd?: string;           // JSON-LD path (e.g., "0.offers.price")
  metaTags?: string;         // Meta tag key (e.g., "og:price:amount")
  dataLayers?: string;       // Data layer path (e.g., "dataLayer.0.product.name")
  microdata?: string;        // Microdata property name
  regex?: string;            // Post-processing regex
  transformations?: FieldTransformation[]; // Data transformations
}
```

### Data Transformations

Apply transformations to extracted values:

```typescript
const selector = {
  jsonLd: '0.offers.price',
  transformations: [
    { type: 'regex', pattern: '([0-9.]+)', flags: 'g' },
    { type: 'parseNumber' },
    { type: 'trim' }
  ]
};
```

Available transformations:
- `regex`: Apply regular expression
- `replace`: String replacement
- `trim`: Remove whitespace
- `lowercase`/`uppercase`: Case conversion
- `parseNumber`: Convert to number
- `parseBoolean`: Convert to boolean

### Path Evaluation

The library supports complex path evaluation for nested data:

```typescript
import { evaluateStructuredDataPath } from '@pricepatrol/parser';

const data = {
  products: [
    { name: "Product 1", offers: [{ price: "10.99" }] }
  ]
};

// Extract nested array data
const price = evaluateStructuredDataPath(data, 'products[0].offers[0].price');
console.log(price); // "10.99"
```

## Modules

### Universal Processing (`@pricepatrol/parser/processing`)

Core data processing functionality that works in any JavaScript environment:

- `StructuredDataProcessor`
- `evaluateStructuredDataPath`
- Type definitions

### Browser Extraction (`@pricepatrol/parser/browser`)

Browser-specific DOM extraction functionality:

- `BrowserDataExtractor`
- `createBrowserExtractor`
- `extractJsonLdData`
- `extractMetaTags`
- `extractDataLayers`
- `extractMicrodata`

## Confidence Scoring

The library provides confidence scores for extracted data based on the source:

- **JSON-LD**: 0.9 (highest confidence)
- **Meta Tags**: 0.8
- **Data Layers**: 0.7
- **Microdata**: 0.6
- **Custom Data Layers**: 0.5

```typescript
const result = processor.processSelector(data, selector);
console.log(result?.confidence); // 0.9 for JSON-LD source
```

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js**: 18.0.0+
- **JSDOM**: Supported for server-side testing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -am 'Add new feature'`
5. Push to branch: `git push origin feature/new-feature`
6. Submit a pull request

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.0
- Initial release
- Core structured data processing
- Browser DOM extraction
- Comprehensive test suite
- TypeScript support