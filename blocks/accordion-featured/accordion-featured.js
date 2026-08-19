/*
 * Accordion Featured Block
 * "We can help you" featured expandable list.
 * Each row becomes a <details>/<summary> accordion item.
 * Behaviour mirrors the source: the first item is open by default and
 * exactly one item is open at a time (opening one closes the others).
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const items = [];

  [...block.children].forEach((row) => {
    // Image is optional (older 2-column content has none; authors may leave
    // the image field empty). Find it by content, not column index.
    const cols = [...row.children];
    const imageCol = cols.find((col) => col.querySelector('picture'));
    const [label, body] = cols.filter((col) => col !== imageCol && (
      col.textContent.trim() || col.querySelector('a')
    ));
    if (!label || !body) return;

    // decorate accordion item label
    const summary = document.createElement('summary');
    summary.className = 'accordion-featured-item-label';
    summary.append(...label.childNodes);

    // decorate accordion item body, leading with the image when present
    body.className = 'accordion-featured-item-body';
    if (imageCol) {
      imageCol.className = 'accordion-featured-item-image';
      body.prepend(imageCol);
    }

    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-featured-item';
    details.append(summary, body);
    row.replaceWith(details);
    items.push(details);
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // One open at a time: opening an item closes the others.
  items.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        items.forEach((other) => {
          if (other !== details) other.open = false;
        });
      }
    });
  });

  // Open the first item by default (source shows the first tile expanded).
  if (items.length) items[0].open = true;
}
