/**
 * Columns Product (product detail hero)
 * Two columns: LEFT = title, intro, features list, status/sustainability pills, CTA.
 * RIGHT = product image + disclaimer.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cols = row ? [...row.children] : [];
  block.classList.add(`columns-product-${cols.length}-cols`);

  // Identify the media cell (contains a picture) vs the content cell.
  cols.forEach((col) => {
    if (col.querySelector('picture')) {
      col.classList.add('columns-product-media');
    } else {
      col.classList.add('columns-product-content');
    }
  });

  const content = block.querySelector('.columns-product-content');
  if (!content) return;

  // Hide the leftover "See more details / See less details" toggle (source hides it
  // when the copy is short, so it is not visible on the original page).
  [...content.querySelectorAll(':scope > p')].forEach((p) => {
    if (/^see more details/i.test(p.textContent.trim())) {
      p.classList.add('columns-product-toggle');
    }
  });

  // Classify the "label + ul" pairs.
  // First list = features (bulleted); the rest = status / sustainability pill groups.
  const lists = [...content.querySelectorAll(':scope > ul')];
  lists.forEach((ul, i) => {
    const label = ul.previousElementSibling;
    if (i === 0) {
      ul.classList.add('columns-product-features');
      if (label && label.tagName === 'P') label.classList.add('columns-product-features-label');
    } else {
      ul.classList.add('columns-product-tag-list');
      if (label && label.tagName === 'P') label.classList.add('columns-product-status-label');
    }
  });

  // Group each status "label + pill list" and wrap all groups in a flex container so
  // the Religious Status and Sustainability groups sit side by side (as on the source).
  const statusLists = [...content.querySelectorAll(':scope > ul.columns-product-tag-list')];
  if (statusLists.length) {
    const tagsWrapper = document.createElement('div');
    tagsWrapper.className = 'columns-product-tags';
    const firstLabel = statusLists[0].previousElementSibling;
    const insertRef = firstLabel && firstLabel.classList.contains('columns-product-status-label')
      ? firstLabel : statusLists[0];
    content.insertBefore(tagsWrapper, insertRef);

    statusLists.forEach((ul) => {
      const prev = ul.previousElementSibling;
      const label = prev && prev.classList.contains('columns-product-status-label') ? prev : null;
      const group = document.createElement('div');
      group.className = 'columns-product-status';
      if (label) group.appendChild(label);
      group.appendChild(ul);
      tagsWrapper.appendChild(group);
    });
  }

  // Turn the standalone CTA link into a button (EDS skips this because its href is empty).
  const ctaPara = [...content.querySelectorAll(':scope > p')].find((p) => {
    const a = p.querySelector('a');
    return a && p.childElementCount === 1 && p.textContent.trim() === a.textContent.trim();
  });
  if (ctaPara) {
    ctaPara.classList.add('columns-product-cta');
    const a = ctaPara.querySelector('a');
    if (a) a.classList.add('button');
  }
}
