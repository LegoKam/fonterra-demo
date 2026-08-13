/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbParser from './parsers/breadcrumb.js';
import columnsProductParser from './parsers/columns-product.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsBenefitParser from './parsers/cards-benefit.js';
import carouselNewsParser from './parsers/carousel-news.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (ingredient-product-detail)
const PAGE_TEMPLATE = {
  name: 'ingredient-product-detail',
  description: 'Deep product-detail layout for a single ingredient',
  urls: [
    'https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html',
  ],
  blocks: [
    { name: 'breadcrumb', instances: ['.comp__breadcrumbs'] },
    { name: 'columns-product', instances: ['.productDetailBanner'] },
    { name: 'columns-feature', instances: ['.imageTextOverlay'] },
    { name: 'cards-benefit', instances: ['.textIconCard'] },
    { name: 'carousel-news', instances: ['.pageTeaser__wrapper.tileCarousel'] },
    // NOTE: the `form` block (.integratedContactForm) and the newsletter
    // (.emailsubscription.esBar) are intentionally NOT parsed here — they are
    // removed by nzmp-cleanup (beforeTransform) because there is no `form`
    // component in the project (md2jcr would error "The component 'Form' does
    // not exist"), matching the home-page treatment.
  ],
  sections: [
    { id: 'section-1', name: 'Breadcrumb', selector: '.comp__breadcrumbs', style: null, blocks: ['breadcrumb'], defaultContent: [] },
    { id: 'section-2', name: 'Product hero', selector: '.productDetailBanner', style: null, blocks: ['columns-product'], defaultContent: [] },
    { id: 'section-3', name: 'Product content grid', selector: ['.page-content-product > div.row'], style: null, blocks: ['columns-feature', 'cards-benefit', 'carousel-news'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  breadcrumb: breadcrumbParser,
  'columns-product': columnsProductParser,
  'columns-feature': columnsFeatureParser,
  'cards-benefit': cardsBenefitParser,
  'carousel-news': carouselNewsParser,
};

// TRANSFORMER REGISTRY — section transformer runs after cleanup when 2+ sections.
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
    let matched = false;
    blockDef.instances.forEach((selector) => {
      if (matched) return;
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
      matched = true;
    });
    if (!matched) {
      console.warn(`Block "${blockDef.name}" not found with any selector: ${blockDef.instances.join(', ')}`);
    }
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
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
