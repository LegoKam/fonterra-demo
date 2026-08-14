import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else div.className = 'cards-teaser-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  /*
   * Each teaser card is a single link wrapping the whole card. If the card
   * body holds exactly one link, promote it to wrap the entire <li> so the
   * full card (image + title + description) is clickable, matching the source
   * pageTeaser markup where each tile is one anchor.
   */
  [...ul.children].forEach((li) => {
    const link = li.querySelector('a[href]');
    if (link && li.querySelectorAll('a[href]').length === 1) {
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'cards-teaser-card-link';
      if (link.getAttribute('aria-label')) a.setAttribute('aria-label', link.getAttribute('aria-label'));
      while (li.firstChild) a.append(li.firstChild);
      // unwrap the original inline link, keeping its text as the "Learn more" affordance
      const inner = a.querySelector('a[href]');
      if (inner) {
        const span = document.createElement('span');
        span.className = 'cards-teaser-card-cta';
        span.textContent = inner.textContent;
        inner.replaceWith(span);
      }
      li.append(a);
    }
  });

  block.textContent = '';
  block.append(ul);
}
