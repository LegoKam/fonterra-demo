/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-product (base: columns / core/franklin/components/columns).
 * Source: https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html (.productDetailBanner)
 * Generated: 2026-08-13
 *
 * Columns block. Row 1 = block name (added by createBlock). Row 2 holds the two
 * columns side by side. Per the field-hinting rules, Columns blocks do NOT use
 * field:comment hints — cells hold default content only.
 *   Cell 1 -> product copy: headline, description, features list, tag lists, enquire CTA
 *   Cell 2 -> product image (resolved from <img> or background-image div)
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
  // The two product columns. First .productDetailBanner__col carries the copy,
  // the trailing one carries the image carousel.
  const cols = Array.from(element.querySelectorAll(':scope .productDetailBanner__col'));

  // INPUT: content column pieces.
  const headline = element.querySelector('.main-headline h1, .main-headline h2, .headline h1, h1');
  const description = element.querySelector('.copy, .copyWrapper');
  const features = element.querySelector('.productDetailBanner__col--feature');
  const tags = element.querySelector('.productDetailBanner__tags');
  const cta = element.querySelector('.buttonLink a, a.nzmpBtn');

  const contentCell = [];
  if (headline) contentCell.push(headline);
  if (description) contentCell.push(description);
  if (features) contentCell.push(features);
  if (tags) contentCell.push(tags);
  if (cta) contentCell.push(cta);

  // INPUT: product image lives in the last column's carousel.
  const imageScope = cols.length ? cols[cols.length - 1] : element;
  const img = resolveImage(imageScope, document, {
    imgSel: '.carousel-inner img, .item img, img',
    bgSel: '.carousel-item, .item',
    alt: headline ? headline.textContent.trim() : '',
  });

  const imageCell = [];
  if (img) imageCell.push(img);
  // Image disclaimer accompanies the product image (appears once; dedupe by text).
  const disclaimers = Array.from(element.querySelectorAll('.disclaimerText'));
  const seenDisc = new Set();
  disclaimers.forEach((d) => {
    const t = (d.textContent || '').trim();
    if (t && !seenDisc.has(t)) {
      seenDisc.add(t);
      imageCell.push(d);
    }
  });

  // Empty-block guard.
  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 2: two columns side by side.
  const cells = [[contentCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
