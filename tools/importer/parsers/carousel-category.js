/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-category (base: carousel).
 * Source: https://www.nzmp.com/global/en.html (.horizontalCategoryCarousel__container)
 * Generated: 2026-08-13
 *
 * Container block. Each `.horizontalCategoryCarousel__card` becomes a 2-column row:
 *   Cell 1 -> media_image (card image; media_imageAlt collapses into the img alt attribute)
 *   Cell 2 -> content_text (title heading, description, "Explore" CTA) as richtext
 *
 * The section heading (".horizontalCategoryCarousel__title" -> "Applications") is handled as
 * section default content, so it lives outside the block element and is not extracted here.
 */
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve a card image robustly. The scraped DOM carries real <img> tags, but the live page
// renders card images as CSS background-image on <div>s (and slick lazy-loads them). Try a
// real <img> first (normalizing lazy attrs), then fall back to a background-image element,
// synthesizing an <img> so WebImporter.rules.adjustImageUrls can absolutize the URL downstream.
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

export default function parse(element, { document }) {
  // Slick duplicates every card (`.slick-cloned` + repeated infinite/center clones).
  // Drop tagged clones first, then dedupe by identity (CTA href + title text) so a slide
  // appears at most once regardless of how many clones the live DOM rendered.
  const seen = new Set();
  const cards = Array.from(element.querySelectorAll('.horizontalCategoryCarousel__card'))
    .filter((card) => !card.classList.contains('slick-cloned'))
    .filter((card) => {
      const href = (card.querySelector('a[href]') || {}).href || '';
      const title = (card.querySelector('.horizontalCategoryCarousel__card-title, h2, h3') || {}).textContent || '';
      const key = `${href}::${title.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const cells = [];

  cards.forEach((card) => {
    // INPUT: title, description, CTA.
    const title = card.querySelector('.horizontalCategoryCarousel__card-title, h2, h3');
    const desc = card.querySelector('.horizontalCategoryCarousel__copy p, .horizontalCategoryCarousel__copy');
    const cta = card.querySelector('a.nzmpBtn, .horizontalCategoryCarousel__content__fade a, a.button-link, a');

    // INPUT: card image. Live page renders it as background-image on
    // .horizontalCategoryCarousel__card__wrapper; scraped DOM uses <img>.
    const img = resolveImage(card, document, {
      imgSel: '.horizontalCategoryCarousel__card__wrapper > img, img',
      bgSel: '.horizontalCategoryCarousel__card__wrapper, .horizontalCategoryCarousel__card__image',
      alt: title ? title.textContent.trim() : '',
    });

    // Cell 1: media_image (media_imageAlt collapses into the img alt attribute)
    let imageCell = '';
    if (img) {
      imageCell = [document.createComment(' field:media_image '), img];
    }

    // Cell 2: content_text (richtext grouping title + description + CTA)
    const contentNodes = [document.createComment(' field:content_text ')];
    if (title) contentNodes.push(title);
    if (desc && desc.textContent.trim()) contentNodes.push(desc);
    if (cta) contentNodes.push(cta);

    if (img || title) {
      cells.push([imageCell, contentNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-category', cells });
  element.replaceWith(block);
}
