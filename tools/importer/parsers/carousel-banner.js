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
// Extract a background-image URL from an element's inline style.
function bgUrl(el) {
  if (!el) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
  return m ? m[2].trim() : '';
}

// Resolve a slide/card image robustly. The scraped DOM (cleaned.html) carries real <img>
// tags, but the live page renders these images as CSS background-image on <div>s and slick
// lazy-loads them. Try a real <img> first (normalizing lazy attrs), then fall back to a
// background-image element, synthesizing an <img> so WebImporter.rules.adjustImageUrls can
// absolutize the URL downstream.
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
  // Real slides only; exclude slick clones/duplicates.
  const slides = Array.from(element.querySelectorAll('.homeBanner__item'))
    .filter((slide) => !slide.classList.contains('slick-cloned'));

  const cells = [];

  slides.forEach((slide) => {
    // INPUT: title, optional description, and CTA link.
    const title = slide.querySelector('.homeBanner__title, .title h1, h1, h2');
    const desc = slide.querySelector('.homeBanner__desc, .copy p');
    const cta = slide.querySelector('a.nzmpBtn, .homeBanner__content a, a.button-link, a');

    // INPUT: banner image. Live page uses background-image on .homeBanner__image--desktop;
    // scraped DOM uses <img>. Prefer desktop variant to avoid the duplicate mobile image.
    const img = resolveImage(slide, document, {
      imgSel: '.homeBanner__image--desktop img, .homeBanner__image img, img',
      bgSel: '.homeBanner__image--desktop, .homeBanner__image',
      alt: title ? title.textContent.trim() : '',
    });

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
