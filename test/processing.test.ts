import { describe, it, expect } from "vitest";
import {
  StructuredDataProcessor,
  evaluateStructuredDataPath,
  STRUCTURED_DATA_VERSION,
} from "../src/processing.js";

describe("StructuredDataProcessor", () => {
  const processor = new StructuredDataProcessor();

  const mockStructuredData = {
    version: "1.0.0",
    jsonLd: [
      {
        "@type": "Product",
        name: "TCL 65 Inch P7K QLED 4K Google TV",
        sku: "N242346",
        brand: {
          "@type": "Brand",
          name: "TCL"
        },
        offers: {
          "@type": "Offer",
          price: "1399.00",
          priceCurrency: "NZD",
          availability: "https://schema.org/InStock"
        }
      }
    ],
    metaTags: {
      "og:title": "TCL 65 Inch P7K QLED 4K Google TV - Noel Leeming",
      "og:price:amount": "1399.00",
      "og:price:currency": "NZD",
      "product:price:amount": "1399.00"
    },
    dataLayers: {
      dataLayer: [
        {
          event: "productView",
          product: {
            name: "TCL 65 Inch TV",
            sku: "N242346",
            price: 1399.00,
            currency: "NZD",
            brand: "TCL"
          }
        }
      ]
    },
    url: "https://www.noelleeming.co.nz/p/tcl-65-inch-tv/N242346.html",
    pageTitle: "TCL 65 Inch P7K QLED 4K Google TV - Noel Leeming",
    timestamp: "2025-01-23T10:30:00Z",
    extractorVersion: "1.0.0"
  };

  describe("processSelector", () => {
    it("should extract data from JSON-LD", () => {
      const selector = {
        jsonLd: "0.name"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result).toEqual({
        value: "TCL 65 Inch P7K QLED 4K Google TV",
        source: "jsonLd",
        path: "0.name",
        confidence: 0.9
      });
    });

    it("should extract data from meta tags", () => {
      const selector = {
        metaTags: "og:title"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result).toEqual({
        value: "TCL 65 Inch P7K QLED 4K Google TV - Noel Leeming",
        source: "metaTags",
        path: "og:title",
        confidence: 0.8
      });
    });

    it("should extract data from data layers", () => {
      const selector = {
        dataLayers: "dataLayer.0.product.name"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result).toEqual({
        value: "TCL 65 Inch TV",
        source: "dataLayers",
        path: "dataLayer.0.product.name",
        confidence: 0.7
      });
    });

    it("should prefer higher confidence sources", () => {
      const selector = {
        jsonLd: "0.name",
        metaTags: "og:title",
        dataLayers: "dataLayer.0.product.name"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      // Should prefer JSON-LD (highest confidence)
      expect(result?.source).toBe("jsonLd");
      expect(result?.value).toBe("TCL 65 Inch P7K QLED 4K Google TV");
    });

    it("should apply regex transformations", () => {
      const selector = {
        jsonLd: "0.offers.price",
        regex: "([0-9.]+)"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result?.value).toBe("1399.00");
    });

    it("should apply field transformations", () => {
      const selector = {
        jsonLd: "0.offers.price",
        transformations: [
          { type: "parseNumber" as const }
        ]
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result?.value).toBe(1399);
    });

    it("should return null for missing data", () => {
      const selector = {
        jsonLd: "0.nonexistent"
      };

      const result = processor.processSelector(mockStructuredData, selector);

      expect(result).toBeNull();
    });
  });

  describe("processRecipe", () => {
    it("should process multiple fields", () => {
      const selectors = {
        productName: { jsonLd: "0.name" },
        price: { jsonLd: "0.offers.price", transformations: [{ type: "parseNumber" as const }] },
        sku: { jsonLd: "0.sku" },
        brandName: { jsonLd: "0.brand.name" }
      };

      const result = processor.processRecipe(mockStructuredData, selectors);

      expect(result.productName?.value).toBe("TCL 65 Inch P7K QLED 4K Google TV");
      expect(result.price?.value).toBe(1399);
      expect(result.sku?.value).toBe("N242346");
      expect(result.brandName?.value).toBe("TCL");
    });

    it("should handle missing fields gracefully", () => {
      const selectors = {
        productName: { jsonLd: "0.name" },
        nonexistent: { jsonLd: "0.missing" }
      };

      const result = processor.processRecipe(mockStructuredData, selectors);

      expect(result.productName?.value).toBe("TCL 65 Inch P7K QLED 4K Google TV");
      expect(result.nonexistent).toBeUndefined();
    });
  });

  describe("validateStructuredData", () => {
    it("should validate correct structured data", () => {
      const isValid = StructuredDataProcessor.validateStructuredData(mockStructuredData);
      expect(isValid).toBe(true);
    });

    it("should reject invalid structured data", () => {
      const invalidData = {
        jsonLd: "not an array",
        metaTags: {},
        dataLayers: {}
      };

      const isValid = StructuredDataProcessor.validateStructuredData(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe("version management", () => {
    it("should return correct version", () => {
      expect(processor.getVersion()).toBe(STRUCTURED_DATA_VERSION);
    });
  });
});

describe("evaluateStructuredDataPath", () => {
  const testData = {
    simple: "value",
    nested: {
      property: "nested value"
    },
    array: ["item1", "item2", "item3"],
    complex: {
      items: [
        { name: "item1", price: 10 },
        { name: "item2", price: 20 }
      ]
    },
    "property:with:colons": "special value"
  };

  it("should extract simple properties", () => {
    expect(evaluateStructuredDataPath(testData, "simple")).toBe("value");
  });

  it("should extract nested properties", () => {
    expect(evaluateStructuredDataPath(testData, "nested.property")).toBe("nested value");
  });

  it("should extract array items", () => {
    expect(evaluateStructuredDataPath(testData, "array[0]")).toBe("item1");
    expect(evaluateStructuredDataPath(testData, "array[2]")).toBe("item3");
  });

  it("should extract complex nested array items", () => {
    expect(evaluateStructuredDataPath(testData, "complex.items[0].name")).toBe("item1");
    expect(evaluateStructuredDataPath(testData, "complex.items[1].price")).toBe("20");
  });

  it("should handle multiple array indices", () => {
    const data = [[[{ value: "deep" }]]];
    expect(evaluateStructuredDataPath(data, "[0][0][0].value")).toBe("deep");
  });

  it("should handle properties with colons", () => {
    expect(evaluateStructuredDataPath(testData, "property:with:colons")).toBe("special value");
  });

  it("should return null for missing paths", () => {
    expect(evaluateStructuredDataPath(testData, "nonexistent")).toBeNull();
    expect(evaluateStructuredDataPath(testData, "nested.missing")).toBeNull();
    expect(evaluateStructuredDataPath(testData, "array[10]")).toBeNull();
  });

  it("should handle invalid input gracefully", () => {
    expect(evaluateStructuredDataPath(null, "path")).toBeNull();
    expect(evaluateStructuredDataPath(testData, "")).toBeNull();
    expect(evaluateStructuredDataPath(undefined, "path")).toBeNull();
  });
});