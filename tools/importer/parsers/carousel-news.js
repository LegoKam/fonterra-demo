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

export default function parse(element, { document }) {
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
