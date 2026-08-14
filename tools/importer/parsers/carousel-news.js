/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-news (base: carousel).
 * Source: https://www.nzmp.com/global/en.html (.slickCarouselArticles__slick)
 * Generated: 2026-08-13
 *
 * Container block. Each `.latestNews__box` article becomes a 2-column row:
 *   Cell 1 -> media_image (article thumbnail; media_imageAlt collapses into the img alt attribute)
 *   Cell 2 -> content_text (richtext: category label, headline heading, date, and the article
 *             link) so the whole teaser is authorable and clickable.
 *
 * The section heading ("Read the latest from NZMP") and the "View all" CTA live in
 * `.title-arrows`/`.ctabutton` outside the slick track and are handled as section default
 * content, so they are not extracted here.
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve an article thumbnail robustly. The scraped DOM carries real <img> tags, but the
// live page renders thumbnails as CSS background-image on <div>s (and slick lazy-loads them).
// Try a real <img> first (normalizing lazy attrs), then fall back to a background-image
// element, synthesizing an <img> so WebImporter.rules.adjustImageUrls can absolutize it.
function resolveImage(scope, document, { imgSel, bgSel, alt }) {
  const img = imgSel ? scope.querySelector(imgSel) : null;
  if (img) {
    const real = img.getAttribute('data-src') || img.getAttribute('data-lazy')
      || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
    if (real && (!img.getAttribute('src') || img.getAttribute('src').trim() === '')) {
      img.setAttribute('src', real);
    }
    if (img.getAttribute('src') && img.getAttribute('src').trim()) {
      if (alt && !img.getAttribute('alt')) img.setAttribute('alt', alt);
      return img;
    }
  }
  let url = '';
  const bgEls = bgSel ? Array.from(scope.querySelectorAll(bgSel)) : [];
  for (let i = 0; i < bgEls.length && !url; i += 1) url = bgUrl(bgEls[i]);
  if (!url) url = bgUrl(scope);
  if (url) {
    const newImg = document.createElement('img');
    newImg.setAttribute('src', url);
    if (alt) newImg.setAttribute('alt', alt);
    return newImg;
  }
  return null;
}

// Tile-carousel / card-grid variants that share the carousel-news 2-column
// image+text block model but use different source DOM. Supported item selectors:
//   .tileCarousel__slick--tile   related-products carousel (ingredient pages)
//   .surestart-card              related-concept slick carousel + section-landing tile grid
//                                (the actual card; querying it directly avoids matching the
//                                 outer .pageteaser-tile__slick-tile wrapper twice)
//   .tileListing__card           key-ingredients static tile grid (concept pages)
const TILE_ITEM_SELECTOR = '.tileCarousel__slick--tile, .surestart-card, .tileListing__card';

function parseTileCarousel(element, document) {
  const seen = new Set();
  // .tileListing__card is itself an <a>; the others contain descendant tiles.
  // Filter slick clones by ANCESTOR — a .surestart-card inside a .slick-cloned wrapper
  // does not itself carry the clone class.
  let tiles = Array.from(element.querySelectorAll(TILE_ITEM_SELECTOR))
    .filter((tile) => !tile.classList.contains('slick-cloned')
      && !(tile.closest && tile.closest('.slick-cloned')));
  // If the element itself is the single card (tileListing__card matched as root), include it.
  if (tiles.length === 0 && element.matches && element.matches('.tileListing__card')) {
    tiles = [element];
  }
  tiles = tiles.filter((tile) => {
    const linkEl = tile.matches('a[href]') ? tile : tile.querySelector('a[href]');
    const href = (linkEl || {}).href || (linkEl && linkEl.getAttribute ? linkEl.getAttribute('href') : '') || '';
    const title = (tile.querySelector('.headline, h5, h4, h3, h2') || {}).textContent || '';
    const key = `${href}::${title.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const cells = [];
  tiles.forEach((tile) => {
    const category = tile.querySelector('.small p, .small, .categoryTitle');
    const title = tile.querySelector('.surestart-card__caption__title h4, .surestart-card__caption__title, .headline, h5, h4, h3, h2');
    const copy = tile.querySelector('.surestart-card__caption__content, .copy, .tileListing__tiles--tile-contentWrapper .copy');
    const linkEl = tile.matches('a[href]') ? tile : tile.querySelector('a[href]');
    const img = resolveImage(tile, document, {
      imgSel: 'img',
      bgSel: '.tileCarousel__slick--image, .surestart-card__figure, .tileListing__tiles--tile-imageWrapper, [class*="image"]',
      alt: title ? title.textContent.trim() : '',
    });

    let imageCell = '';
    if (img) imageCell = [document.createComment(' field:media_image '), img];

    const contentNodes = [document.createComment(' field:content_text ')];
    if (category && category.textContent.trim()) contentNodes.push(category);
    if (title && title.textContent.trim()) contentNodes.push(title);
    if (copy && copy.textContent.trim()) contentNodes.push(copy);
    if (linkEl) {
      const href = linkEl.getAttribute('href');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = title ? title.textContent.trim() : href;
        contentNodes.push(a);
      }
    }
    if (img || title) cells.push([imageCell, contentNodes]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  // Supported source structures that share the carousel-news block:
  //   1. `.latestNews__box` news teasers (homepage "Read the latest")
  //   2. tile/card grids: .tileCarousel__slick--tile (ingredient related-products),
  //      .pageteaser-tile__slick-tile (concept related-concept), .tileListing__card
  //      (concept key-ingredients). Handled by parseTileCarousel.
  // If there are no news boxes but there are tiles, use the tile path.
  const hasNewsBoxes = element.querySelector('.latestNews__box');
  const hasTiles = element.querySelector(TILE_ITEM_SELECTOR)
    || (element.matches && element.matches('.tileListing__card'));
  if (!hasNewsBoxes && hasTiles) {
    parseTileCarousel(element, document);
    return;
  }

  // Slick duplicates every article (`.slick-cloned` + repeated infinite clones).
  // Drop tagged clones, then dedupe by identity (article href + headline).
  const seen = new Set();
  const boxes = Array.from(element.querySelectorAll('.latestNews__box'))
    .filter((box) => !box.classList.contains('slick-cloned'))
    .filter((box) => {
      const href = (box.querySelector('a[href]') || {}).href || '';
      const headline = (box.querySelector('.headline h5, .headline, h5') || {}).textContent || '';
      const key = `${href}::${headline.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const cells = [];

  boxes.forEach((box) => {
    // INPUT: teaser parts.
    const category = box.querySelector('.categoryTitle p, .categoryTitle');
    const headline = box.querySelector('.headline h5, .headline, h5');
    const date = box.querySelector('.date span, .date');
    const link = box.querySelector('a[href]');

    // INPUT: article thumbnail. Live page renders it as background-image on
    // .latestNews__box-image; scraped DOM uses <img>.
    const img = resolveImage(box, document, {
      imgSel: '.latestNews__box-image img, img',
      bgSel: '.latestNews__box-image',
      alt: headline ? headline.textContent.trim() : '',
    });

    // Cell 1: media_image (media_imageAlt collapses into the img alt attribute)
    let imageCell = '';
    if (img) {
      imageCell = [document.createComment(' field:media_image '), img];
    }

    // Cell 2: content_text (richtext grouping category, headline, date, and article link)
    const contentNodes = [document.createComment(' field:content_text ')];
    if (category && category.textContent.trim()) contentNodes.push(category);
    if (headline && headline.textContent.trim()) contentNodes.push(headline);
    if (date && date.textContent.trim()) contentNodes.push(date);
    if (link) {
      // Build a clean text link ("Read more" -> headline) pointing at the article.
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = headline ? headline.textContent.trim() : link.getAttribute('href');
      contentNodes.push(a);
    }

    if (img || headline) {
      cells.push([imageCell, contentNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}
