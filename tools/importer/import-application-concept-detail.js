/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS (all reused — no new blocks for this template)
import columnsBannerParser from './parsers/columns-banner.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsValueParser from './parsers/cards-value.js';
import carouselNewsParser from './parsers/carousel-news.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

// PAGE TEMPLATE CONFIGURATION (application-concept-detail)
const PAGE_TEMPLATE = {
  name: 'application-concept-detail',
  description: 'Application concept/recipe detail layout',
  urls: ['https://www.nzmp.com/global/en/applications/active-lifestyle/applications/food-and-snacks/high-protein-brownie-mix.html'],
  blocks: [
    { name: 'columns-banner', instances: ['.cq-dd-image.productBanner'] },
    { name: 'columns-feature', instances: ['.imageTextOverlay'] },
    { name: 'cards-value', instances: ['.multicolumn-grid:not(:has(.cmp-multicolumn-grid__headline))'] },
    { name: 'carousel-news', instances: ['.tileListing', '.cmp-pageTeaser__slickCarousel'] },
    // breadcrumb + forms are stripped by nzmp-cleanup (no components exist).
  ],
  sections: [
    { id: 'section-1', name: 'Concept banner', selector: '.cq-dd-image.productBanner', style: null, blocks: ['columns-banner'], defaultContent: [] },
    { id: 'section-2', name: 'Overview', selector: ['#gridsection-overview'], style: null, blocks: ['columns-feature'], defaultContent: [] },
    { id: 'section-3', name: 'Customer Benefits', selector: ['#gridsection-customer-benefits'], style: 'grey', blocks: ['cards-value'], defaultContent: [] },
    { id: 'section-4', name: 'Key Ingredients', selector: ['#gridsection-key-ingredients'], style: null, blocks: ['carousel-news'], defaultContent: [] },
    { id: 'section-5', name: 'Related Concept', selector: ['#gridsection-related-concept'], style: null, blocks: ['carousel-news'], defaultContent: [] },
    { id: 'section-6', name: 'Ask an Expert', selector: ['#gridsection-ask-an-expert'], style: null, blocks: ['cards-value'], defaultContent: [] },
  ],
};

const parsers = {
  'columns-banner': columnsBannerParser,
  'columns-feature': columnsFeatureParser,
  'cards-value': cardsValueParser,
  'carousel-news': carouselNewsParser,
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Selector not supported, skipping: ${selector}`);
        return;
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });
    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
