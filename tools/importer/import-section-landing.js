/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS (reused — no new blocks)
import carouselNewsParser from './parsers/carousel-news.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

// PAGE TEMPLATE CONFIGURATION (section-landing)
const PAGE_TEMPLATE = {
  name: 'section-landing',
  description: 'Top-level section landing layout with intro + category tile grid',
  urls: ['https://www.nzmp.com/global/en/applications.html'],
  blocks: [
    // The category tile grid is a .pageTeaser of .surestart-card items — handled by
    // the carousel-news parser's tile/card path. The intro heading + paragraph are
    // default content (kept outside the block).
    { name: 'carousel-news', instances: ['.pageTeaser.list.parbase', '.cmp-pageTeaser__default'] },
    // breadcrumb + newsletter form stripped by nzmp-cleanup (no components).
  ],
  sections: [
    { id: 'section-1', name: 'Intro', selector: ['#gridsection-intro', '.contentHolder'], style: null, blocks: [], defaultContent: [] },
    { id: 'section-2', name: 'Category tile grid', selector: ['.pageTeaser.list.parbase'], style: null, blocks: ['carousel-news'], defaultContent: [] },
  ],
};

const parsers = { 'carousel-news': carouselNewsParser };

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
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
