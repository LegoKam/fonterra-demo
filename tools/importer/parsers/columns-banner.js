/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-banner (base: columns).
 * Source: https://www.nzmp.com/global/en/about-nzmp/global-ingredients.html (.cq-dd-image.categoryBanner)
 * Generated: 2026-08-13
 *
 * Columns block (core/franklin/components/columns), 2 columns / 1 content row.
 * Table shape: row 1 = block name; row 2 = the two columns (cells). Per the Columns
 * convention, cells hold DEFAULT CONTENT only — no field hints.
 *   Cell 1 (left)  -> category intro: heading (h1) + intro copy (p)
 *   Cell 2 (right) -> banner image
 *
 * The category banner renders a real <img> in the scraped DOM but may use a CSS
 * background-image on the live/lazy-loaded page, so resolve robustly.
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve an image: prefer a real <img> (normalizing lazy attrs), else synthesize
// one from a background-image element so the URL survives import.
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
  if (url) {
    const newImg = document.createElement('img');
    newImg.setAttribute('src', url);
    if (alt) newImg.setAttribute('alt', alt);
    return newImg;
  }
  return null;
}

export default function parse(element, { document }) {
  // INPUT: left column — heading + intro copy.
  const heading = element.querySelector('.categoryBanner__row--left .headline h1, .categoryBanner__row--left h1, .headline h1, h1, h2');
  const copy = element.querySelector('.categoryBanner__row--left .copy p, .categoryBanner__row--left .copy, .copy p');

  // INPUT: right column — banner image (real <img> or background-image).
  const img = resolveImage(element, document, {
    imgSel: '.categoryBanner__row--right img, .categoryBanner__row--right-image img, img',
    bgSel: '.categoryBanner__row--right-image, .categoryBanner__row--right',
    alt: heading ? heading.textContent.trim() : '',
  });

  // Empty-block guard.
  if (!heading && !copy && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Cell 1 (left): heading + intro copy. Columns block -> no field hints.
  const leftCell = [];
  if (heading) leftCell.push(heading);
  if (copy && copy.textContent.trim()) leftCell.push(copy);

  // Cell 2 (right): banner image.
  const rightCell = [];
  if (img) rightCell.push(img);

  // One content row with two columns (cells).
  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner', cells });
  element.replaceWith(block);
}
