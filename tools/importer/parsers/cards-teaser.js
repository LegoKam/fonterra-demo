/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser (base: cards / container block).
 * Source: https://www.nzmp.com/global/en/about-nzmp/global-ingredients.html (.pageTeaser__wrapper.twoColStack)
 * Generated: 2026-08-13
 *
 * 2x2 photo teasers. A leading `.headline.section_title` heading precedes the tiles
 * and is DEFAULT content (kept as a sibling before the block). Each
 * `.twoColStack__row--tile` becomes one row per the `card` model (2 cells):
 *   Cell 1 -> image (field:image); imageAlt collapses into the img alt attribute.
 *   Cell 2 -> text (field:text) richtext: title (h3) + copy (p) + the tile link
 *             (the whole tile is wrapped in an <a>; the "Learn more" label becomes
 *             the link text pointing at the tile href).
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve a tile image: prefer a real <img> (normalizing lazy attrs), else synthesize
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
  // INPUT: each tile is a teaser card.
  const tiles = Array.from(element.querySelectorAll('.twoColStack__row--tile'))
    .filter((tile) => tile.textContent.trim() || tile.querySelector('img'));

  const cells = [];

  tiles.forEach((tile) => {
    const anchor = tile.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const title = tile.querySelector('.twoColStack__row--tile-contents .headline h3, .headline h3, h3, h2, .title');

    // Tile image (real <img> or background-image).
    const img = resolveImage(tile, document, {
      imgSel: '.twoColStack__row--tile-image img, img',
      bgSel: '.twoColStack__row--tile-image',
      alt: title ? title.textContent.trim() : '',
    });

    // Body copy.
    const copy = tile.querySelector('.copy p, .copy, p');

    // Link label ("Learn more"); build a real anchor pointing at the tile href.
    const labelEl = tile.querySelector('.textLink .link_itemLabel, .textLink, .link_itemLabel');
    let link = null;
    if (href) {
      link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = labelEl && labelEl.textContent.trim()
        ? labelEl.textContent.trim() : 'Learn more';
    }

    // Cell 1: image (field:image; imageAlt collapses to alt). Emit empty if absent.
    let imageCell = '';
    if (img) imageCell = [document.createComment(' field:image '), img];

    // Cell 2: text (field:text) grouping title + copy + link.
    const textNodes = [document.createComment(' field:text ')];
    if (title) textNodes.push(title);
    if (copy && copy.textContent.trim()) textNodes.push(copy);
    if (link) textNodes.push(link);

    if (img || title || (copy && copy.textContent.trim()) || link) {
      cells.push([imageCell, textNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });

  // Leading `.headline.section_title` is DEFAULT content preceding the tiles; keep its
  // heading(s) as siblings before the block.
  const frag = document.createDocumentFragment();
  const sectionTitle = element.querySelector('.headline.section_title, .section_title');
  if (sectionTitle) {
    const headingEls = Array.from(sectionTitle.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    if (headingEls.length) headingEls.forEach((h) => frag.appendChild(h));
    else if (sectionTitle.textContent.trim()) frag.appendChild(sectionTitle);
  }
  frag.appendChild(block);
  element.replaceWith(frag);
}
