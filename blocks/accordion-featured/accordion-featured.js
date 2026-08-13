/*
 * Accordion Featured Block
 * "We can help you" featured expandable list.
 * Each row becomes a <details>/<summary> accordion item.
 * Behaviour mirrors the source: the first item is open by default and
 * exactly one item is open at a time (opening one closes the others).
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const items = [];

  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-featured-item-label';
    summary.append(...label.childNodes);

    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-featured-item-body';

    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-featured-item';
    details.append(summary, body);
    row.replaceWith(details);
    items.push(details);
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
