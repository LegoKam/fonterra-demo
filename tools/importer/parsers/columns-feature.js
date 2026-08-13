/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature (base: columns / core/franklin/components/columns).
 * Source: https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html (.imageTextOverlay)
 * Generated: 2026-08-13
 *
 * Columns block. Row 1 = block name (added by createBlock). Row 2 holds the two
 * columns side by side. Per the field-hinting rules, Columns blocks do NOT use
 * field:comment hints — cells hold default content only.
 *   Cell 1 -> feature image (resolved from <img> or background-image div)
 *   Cell 2 -> feature content: title heading + copy (applications list)
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve an image: prefer a real <img> (normalizing lazy attrs), else synthesize
// one from a background-image div so the URL survives import.
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
  // INPUT: title + copy in the right-hand contents area.
  const title = element.querySelector('.image-badge__v2-contents .title, .pageIntro__row--right .title, h4, h3, h2');
  const copy = element.querySelector('.image-badge__v2-contents .copy, .pageIntro__row--right .copy');

  // INPUT: feature image on the left.
  const img = resolveImage(element, document, {
    imgSel: '.image-badge__v2-image img, .pageIntro__row--left img, img',
    bgSel: '.image-badge__v2-image, .pageIntro__row--left',
    alt: title ? title.textContent.trim() : '',
  });

  const imageCell = [];
  if (img) imageCell.push(img);

  const contentCell = [];
  if (title) contentCell.push(title);
  if (copy) contentCell.push(copy);

  // Empty-block guard.
  if (!imageCell.length && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 2: image column, content column.
  const cells = [[imageCell, contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
