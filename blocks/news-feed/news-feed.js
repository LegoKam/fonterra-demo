/**
 * News Feed Block
 * Displays a grid of news article cards with image, title, date, excerpt, and read more link
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Transform the block from table structure to a semantic news feed grid
  const ul = document.createElement('ul');

  // Convert rows to list items (each row is a news article)
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const article = document.createElement('article');
    article.className = 'news-article';

    // Process each cell in the row
    cells.forEach((cell, index) => {
      const cellContent = document.createElement('div');

      // First cell typically contains the image
      if (index === 0) {
        cellContent.className = 'news-article-image';
        const picture = cell.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) {
            const optimizedPic = createOptimizedPicture(
              img.src,
              img.alt || 'Article image',
              false,
              [{ width: '400' }],
            );
            moveInstrumentation(img, optimizedPic.querySelector('img'));
            cellContent.append(optimizedPic);
          }
        }
      } else {
        // Other cells contain text content (title, date, excerpt, link)
        cellContent.className = 'news-article-body';
        while (cell.firstElementChild) {
          const element = cell.firstElementChild;
          cellContent.append(element);
        }
      }

      article.append(cellContent);
    });

    li.append(article);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
