/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-banner (base: carousel).
 * Source: https://www.nzmp.com/global/en.html (.homeBanner__container)
 * Generated: 2026-08-13
 *
 * Container block. Each `.homeBanner__item` slide becomes a 2-column row:
 *   Cell 1 -> media_image (background image; media_imageAlt collapses into the img alt attribute)
 *   Cell 2 -> content_text (title heading, optional description, CTA link) as richtext
 */
// Slick carousels lazy-load slide images; promote the real URL into src so extraction works
// against both the scraped DOM and a freshly-loaded live page.
function normalizeLazyImg(img) {
  if (!img) return img;
  const real = img.getAttribute('data-src') || img.getAttribute('data-lazy')
    || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
  if (real && (!img.getAttribute('src') || img.getAttribute('src').trim() === '')) {
    img.setAttribute('src', real);
  }
  return img;
}

export default function parse(element, { document }) {
  // Real slides only; exclude slick clones/duplicates.
  const slides = Array.from(element.querySelectorAll('.homeBanner__item'))
    .filter((slide) => !slide.classList.contains('slick-cloned'));

  const cells = [];

  slides.forEach((slide) => {
    // INPUT: banner renders duplicate desktop/mobile images with the same src; take one.
    const img = slide.querySelector('.homeBanner__image--desktop img, .homeBanner__image img, img');

    // INPUT: title, optional description, and CTA link.
    const title = slide.querySelector('.homeBanner__title, .title h1, h1, h2');
    const desc = slide.querySelector('.homeBanner__desc, .copy p');
    const cta = slide.querySelector('a.nzmpBtn, .homeBanner__content a, a.button-link, a');

    // Cell 1: media_image (media_imageAlt is a collapsed field -> img alt attribute, no hint)
    let imageCell = '';
    if (img) {
      imageCell = [document.createComment(' field:media_image '), img];
    }

    // Cell 2: content_text (richtext grouping title + description + CTA)
    const contentNodes = [document.createComment(' field:content_text ')];
    if (title) contentNodes.push(title);
    if (desc && desc.textContent.trim()) contentNodes.push(desc);
    if (cta) contentNodes.push(cta);

    // Only emit a slide row if it carries real content.
    if (img || title || cta) {
      cells.push([imageCell, contentNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
