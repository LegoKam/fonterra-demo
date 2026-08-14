/* eslint-disable */
/* global WebImporter */
import columnsBannerParser from './parsers/columns-banner.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import carouselNewsParser from './parsers/carousel-news.js';
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

const PAGE_TEMPLATE = {
  name: 'ingredient-listing',
  description: 'Ingredient listing layout with banner, feature panels, product grids',
  urls: ['https://www.nzmp.com/global/en/ingredients/specialty/probiotics.html'],
  blocks: [
    { name: 'columns-banner', instances: ['.cq-dd-image.categoryBanner'] },
    { name: 'columns-feature', instances: ['.imageTextOverlay'] },
    { name: 'carousel-news', instances: ['.tileListing'] },
  ],
  sections: [
    { id: 'section-1', name: 'Category banner', selector: '.cq-dd-image.categoryBanner', style: null, blocks: ['columns-banner'], defaultContent: [] },
    { id: 'section-2', name: 'Content', selector: ['.contentHolder'], style: null, blocks: ['columns-feature', 'carousel-news'], defaultContent: [] },
  ],
};
const parsers = { 'columns-banner': columnsBannerParser, 'columns-feature': columnsFeatureParser, 'carousel-news': carouselNewsParser };
const transformers = [cleanupTransformer, ...(PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : [])];
function executeTransformers(hookName, element, payload) {
  const ep = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => { try { fn.call(null, hookName, element, ep); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); } });
}
function findBlocksOnPage(document, template) {
  const pageBlocks = []; const seen = new Set();
  template.blocks.forEach((bd) => { bd.instances.forEach((sel) => {
    let els = []; try { els = document.querySelectorAll(sel); } catch (e) { return; }
    els.forEach((el) => { if (seen.has(el)) return; seen.add(el); pageBlocks.push({ name: bd.name, selector: sel, element: el }); });
  }); });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr'); main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
