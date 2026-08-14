/* eslint-disable */
/* global WebImporter */

// Shared import script for the small NZMP section templates (about-landing,
// application-concepts-index, solution-detail, application-product-detail,
// application-article, resources-listing, solution-landing). They all draw from
// the same styled block palette; anything not matched falls through as default
// content (headings, richtext paragraphs). breadcrumb + forms are stripped by cleanup.

import columnsBannerParser from './parsers/columns-banner.js';
import columnsProductParser from './parsers/columns-product.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsValueParser from './parsers/cards-value.js';
import carouselNewsParser from './parsers/carousel-news.js';

import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

const PAGE_TEMPLATE = {
  name: 'section-generic',
  description: 'Shared importer for small NZMP section templates',
  urls: [],
  // Order matters: more specific banners/heros first, then features, then card grids.
  blocks: [
    { name: 'columns-banner', instances: ['.cq-dd-image.categoryBanner', '.cq-dd-image.productBanner'] },
    { name: 'columns-product', instances: ['.productDetailBanner'] },
    { name: 'columns-feature', instances: ['.imageTextOverlay'] },
    { name: 'cards-category', instances: ['.multicolumn-grid:has(.cmp-multicolumn-grid__headline)'] },
    { name: 'cards-value', instances: ['.multicolumn-grid:not(:has(.cmp-multicolumn-grid__headline))'] },
    { name: 'carousel-news', instances: ['.tileListing', '.cmp-pageTeaser__slickCarousel', '.cmp-pageTeaser__default', '.pageTeaser.list.parbase'] },
  ],
  // Single content section; the section transformer only splits on 2+ sections, so
  // this keeps everything in one section (no section-metadata needed for these).
  sections: [
    { id: 'section-1', name: 'Content', selector: ['body'], style: null, blocks: [], defaultContent: [] },
  ],
};

const parsers = {
  'columns-banner': columnsBannerParser,
  'columns-product': columnsProductParser,
  'columns-feature': columnsFeatureParser,
  'cards-category': cardsCategoryParser,
  'cards-value': cardsValueParser,
  'carousel-news': carouselNewsParser,
};

// Only the cleanup transformer runs (single section → no section splitting).
const transformers = [cleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const ep = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try {
      fn.call(null, hookName, element, ep);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((bd) => {
    bd.instances.forEach((sel) => {
      let els = [];
      try {
        els = document.querySelectorAll(sel);
      } catch (e) {
        return;
      }
      els.forEach((el) => {
        // Skip if this element is nested inside an already-claimed block element
        // (prevents e.g. a .tileListing inside a claimed container being double-parsed).
        if (seen.has(el)) return;
        let anc = el.parentElement; let claimed = false;
        while (anc) { if (seen.has(anc)) { claimed = true; break; } anc = anc.parentElement; }
        if (claimed) return;
        seen.add(el);
        pageBlocks.push({ name: bd.name, selector: sel, element: el });
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
      report: { title: document.title, template: 'section-generic', blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
