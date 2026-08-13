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
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-benefit-card-image';
      else div.className = 'cards-benefit-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  /*
   * On the source page the "Key benefits" items sit side-by-side in a row.
   * Here each benefit is authored as its own cards-benefit block, so EDS
   * renders three consecutive .cards-benefit-wrapper siblings. Group them
   * into a single flex row so they align in a row (and stack on mobile).
   * Idempotent + order-safe: blocks load sequentially, so each wrapper joins
   * the row created by the first sibling.
   */
  const wrapper = block.closest('.cards-benefit-wrapper');
  if (wrapper && wrapper.parentElement) {
    const prev = wrapper.previousElementSibling;
    let row;
    if (prev && prev.classList.contains('cards-benefit-row')) {
      row = prev;
    } else {
      row = document.createElement('div');
      row.className = 'cards-benefit-row';
      wrapper.parentElement.insertBefore(row, wrapper);
    }
    row.append(wrapper);
  }
}
