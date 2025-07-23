# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-23

### Added
- Initial release of @pricepatrol/parser
- Core structured data processing functionality
- Browser-specific DOM extraction utilities
- Support for JSON-LD, meta tags, data layers, and microdata extraction
- TypeScript support with comprehensive type definitions
- Universal compatibility (browser and Node.js environments)
- Confidence scoring for extraction reliability
- Advanced path evaluation with array indexing support
- Field transformations (regex, parsing, case conversion)
- Comprehensive test suite with 31 passing tests
- Complete documentation and usage examples
- Dual build system (ESM and CommonJS)
- Proper package exports for tree shaking

### Features
- `StructuredDataProcessor` - Core processing class
- `BrowserDataExtractor` - Browser-specific extraction
- `evaluateStructuredDataPath` - Advanced path evaluation
- `extractJsonLdData` - JSON-LD script tag extraction
- `extractMetaTags` - Meta tag extraction
- `extractDataLayers` - Data layer extraction (dataLayer, digitalData, etc.)
- `extractMicrodata` - Microdata extraction from DOM
- Full TypeScript interfaces and type definitions
- Version management and validation

[Unreleased]: https://github.com/StNick/pricepatrol-parser/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/StNick/pricepatrol-parser/releases/tag/v1.0.0