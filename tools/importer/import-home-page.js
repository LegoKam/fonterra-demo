/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselBannerParser from './parsers/carousel-banner.js';
import carouselCategoryParser from './parsers/carousel-category.js';
import accordionFeaturedParser from './parsers/accordion-featured.js';
import carouselNewsParser from './parsers/carousel-news.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nzmp-cleanup.js';
import sectionsTransformer from './transformers/nzmp-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home-page',
  description: 'NZMP global homepage with hero banner carousel, category carousel, featured tiles/vertical carousel, article teaser carousel, contact form, and email subscription bar',
  urls: [
    'https://www.nzmp.com/global/en.html',
  ],
  blocks: [
    {
      name: 'carousel-banner',
      instances: ['.homeBanner__container'],
    },
    {
      name: 'carousel-category',
      instances: ['.horizontalCategoryCarousel__container', '.horizontalCategoryCarousel.duskBlue'],
    },
    {
      name: 'accordion-featured',
      instances: ['.verticalCarousel', '.cmp-featured-tile'],
    },
    {
      name: 'carousel-news',
      instances: ['.slickCarouselArticles__slick', '.pageTeaser__wrapper.slickCarouselArticles'],
    },
    {
      name: 'form',
      instances: ['.emailsubscription.esBar'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero banner carousel',
      selector: '.homeBanner__container',
      style: null,
      blocks: ['carousel-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Applications category carousel',
      selector: ['.horizontalCategoryCarousel.duskBlue', '.pageTeaser.list.parbase'],
      style: 'dark-blue',
      blocks: ['carousel-category'],
      defaultContent: ['.horizontalCategoryCarousel__title'],
    },
    {
      id: 'section-3',
      name: 'We can help you featured list',
      selector: '.verticalCarousel',
      style: null,
      blocks: ['accordion-featured'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Read the latest from NZMP',
      selector: '.responsivegrid-centered',
      style: null,
      blocks: ['carousel-news'],
      defaultContent: ['.title-arrows', '.ctabutton'],
    },
    {
      id: 'section-5',
      name: 'Email subscription bar',
      selector: '.emailsubscription.esBar',
      style: 'blue',
      blocks: ['form'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'carousel-banner': carouselBannerParser,
  'carousel-category': carouselCategoryParser,
  'accordion-featured': accordionFeaturedParser,
  'carousel-news': carouselNewsParser,
  form: formParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer runs after cleanup; only when the template has 2+ sections.
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform (typically document.body or main)
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    // Use the first instance selector that matches on this page, so we don't
    // double-parse the same block via multiple fallback selectors.
    let matched = false;
    blockDef.instances.forEach((selector) => {
      if (matched) return;
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
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

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map the root/homepage URL to `/index` to avoid
    //    an empty path crashing the bundled importer's path polyfill.
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
