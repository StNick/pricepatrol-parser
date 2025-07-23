const { JSDOM } = require('jsdom');

const emptyDom = new JSDOM("<html><body></body></html>");
const document = emptyDom.window.document;
const window = emptyDom.window;

console.log('Document:', typeof document);
console.log('Window:', typeof window);
console.log('QuerySelectorAll exists:', typeof document.querySelectorAll);

const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
console.log('JsonLD length:', jsonLd.length);

const metaTags = document.querySelectorAll('meta[property], meta[name]');
console.log('MetaTags length:', metaTags.length);

const microdata = document.querySelectorAll('[itemscope]');
console.log('Microdata length:', microdata.length);

const hasDataLayer = window && window.dataLayer && Array.isArray(window.dataLayer) && window.dataLayer.length > 0;
console.log('Has dataLayer:', hasDataLayer);

const result = jsonLd.length > 0 || metaTags.length > 0 || microdata.length > 0 || hasDataLayer;
console.log('Result should be:', result);

// Now test the actual class
const path = require('path');
const module = require(path.join(__dirname, 'dist', 'browser.js'));
console.log('Module:', Object.keys(module));