/**
 * Applications Grid Block
 * Displays a grid of application cards (e.g., Yogurts, Milk Powders, Food Manufacturing, etc.)
 * Each card contains an image, title, description, and link
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Transform the block from table structure to a semantic card grid
  const ul = document.createElement('ul');

  // Convert rows to list items (each row is an application card)
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const card = document.createElement('div');
    card.className = 'applications-card';

    // Process each cell in the row
    cells.forEach((cell, index) => {
      const cellContent = document.createElement('div');

      // First cell typically contains the image
      if (index === 0) {
        cellContent.className = 'applications-card-image';
        const picture = cell.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) {
            const optimizedPic = createOptimizedPicture(
              img.src,
              img.alt || 'Application image',
              false,
              [{ width: '400' }],
            );
            moveInstrumentation(img, optimizedPic.querySelector('img'));
            cellContent.append(optimizedPic);
          }
        }
      } else {
        // Other cells contain text content
        cellContent.className = 'applications-card-body';
        while (cell.firstElementChild) {
          cellContent.append(cell.firstElementChild);
        }
      }

      card.append(cellContent);
    });

    li.append(card);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
