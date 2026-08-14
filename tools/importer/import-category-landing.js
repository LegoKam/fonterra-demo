/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsBannerParser from './parsers/columns-banner.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsValueParser from './parsers/cards-value.js';
import cardsTeaserParser from './parsers/cards-teaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

// PAGE TEMPLATE CONFIGURATION (category-landing)
const PAGE_TEMPLATE = {
  name: 'category-landing',
  description: 'Mid-level category/landing layout with intro banner and a grid of child cards',
  urls: ['https://www.nzmp.com/global/en/about-nzmp/global-ingredients.html'],
  blocks: [
    // NOTE: breadcrumb removed — no `Breadcrumb` component in the project (md2jcr
    // errored). Breadcrumbs are nav chrome and are stripped by nzmp-cleanup.
    { name: 'columns-banner', instances: ['.cq-dd-image.categoryBanner'] },
    { name: 'columns-feature', instances: ['.imageTextOverlay'] },
    // cards-category and cards-value both originate from .multicolumn-grid, distinguished
    // ONLY by presence of a .cmp-multicolumn-grid__headline. jsdom (importer DOM) supports
    // :has()/:not(:has()), so these selectors correctly split the two. Each parser is also
    // defensive (bails on the wrong headline-presence type) as a safety net.
    { name: 'cards-category', instances: ['.multicolumn-grid:has(.cmp-multicolumn-grid__headline)'] },
    { name: 'cards-value', instances: ['.multicolumn-grid:not(:has(.cmp-multicolumn-grid__headline))'] },
    { name: 'cards-teaser', instances: ['.pageTeaser__wrapper.twoColStack'] },
    // form + newsletter removed by nzmp-cleanup (no form component).
  ],
  sections: [
    { id: 'section-2', name: 'Category intro banner', selector: '.cq-dd-image.categoryBanner', style: null, blocks: ['columns-banner'], defaultContent: [] },
    { id: 'section-3', name: 'Content holder', selector: ['.contentHolder'], style: null, blocks: ['columns-feature', 'cards-value', 'cards-category', 'cards-teaser'], defaultContent: [] },
  ],
};

const parsers = {
  'columns-banner': columnsBannerParser,
  'columns-feature': columnsFeatureParser,
  'cards-category': cardsCategoryParser,
  'cards-value': cardsValueParser,
  'cards-teaser': cardsTeaserParser,
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
        // :has()/:not(:has()) may be unsupported in the importer DOM — skip gracefully.
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
