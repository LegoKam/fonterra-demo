/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefit (base: cards / container block).
 * Source: https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html (.textIconCard)
 * Generated: 2026-08-13
 *
 * Container block. Each card (`.textIconCard` -> `.cmp-text-icon-card`) becomes a
 * 2-column row per the `card` model:
 *   Cell 1 -> image (field:image; imageAlt collapses into the img alt attribute).
 *             The cell is still emitted (empty) if no image is present.
 *   Cell 2 -> text (field:text) richtext: headline title + description
 *
 * The mapped selector `.textIconCard` matches a single card. Sibling cards on the
 * page share the same selector, so gather all sibling `.textIconCard` elements into
 * one block and remove the extras to avoid duplicate blocks.
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve a card image: prefer a real <img> (normalizing lazy attrs), else synthesize
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
  // Gather this card plus any sibling .textIconCard cards so the whole group
  // becomes a single cards-benefit block.
  const parent = element.parentElement || element;
  let cards = Array.from(parent.querySelectorAll(':scope > .textIconCard'));
  if (!cards.length) cards = [element];
  // Ensure the mapped element is included even if not a direct child match.
  if (!cards.includes(element)) cards.unshift(element);

  const cells = [];

  cards.forEach((card) => {
    // INPUT: card icon/image.
    const title = card.querySelector('.cmp-text-icon-card__headline .title, .cmp-text-icon-card__headline h3, .title h3, h3');
    const img = resolveImage(card, document, {
      imgSel: '.cmp-image img, .image img, img',
      bgSel: '.cmp-image, .image',
      alt: title ? title.textContent.trim() : '',
    });

    // INPUT: description richtext.
    const description = card.querySelector('.cmp-text-icon-card__description, .richtext');

    // Cell 1: image (field:image; imageAlt is a collapsed field -> img alt attribute).
    // Per the Cards convention, the cell is emitted even when empty.
    let imageCell = '';
    if (img) {
      imageCell = [document.createComment(' field:image '), img];
    }

    // Cell 2: text (field:text) richtext grouping title + description
    const textNodes = [document.createComment(' field:text ')];
    if (title) textNodes.push(title);
    if (description && description.textContent.trim()) textNodes.push(description);

    if (img || title || description) {
      cells.push([imageCell, textNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefit', cells });
  // Replace the mapped element with the block; remove sibling cards folded into it.
  cards.forEach((card) => {
    if (card !== element && card.parentNode) card.remove();
  });
  element.replaceWith(block);
}
