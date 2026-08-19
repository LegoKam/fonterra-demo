/*
 * Accordion Featured Block
 * "We can help you" featured expandable list.
 * Each row becomes a <details>/<summary> accordion item.
 * Optional per-item images are shown in a companion media panel
 * (right column on desktop) that tracks the open item.
 * Exactly one item is open at a time; the first item starts open.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function parseRow(row) {
  const cols = [...row.children];
  const imageCol = cols.find((col) => col.querySelector('picture'));
  const [label, body] = cols.filter((col) => col !== imageCol && (
    col.textContent.trim() || col.querySelector('a')
  ));
  return { imageCol, label, body };
}

function showMedia(media, index) {
  const slots = [...media.children];
  if (!slots.length) return;

  let show = index;
  if (!slots[show]?.querySelector('picture')) {
    const current = slots.findIndex((el) => el.classList.contains('is-active'));
    show = current >= 0
      ? current
      : slots.findIndex((el) => el.querySelector('picture'));
  }
  if (show < 0) return;

  slots.forEach((el, i) => {
    const active = i === show;
    el.classList.toggle('is-active', active);
    el.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
}

function describeLearnMore(link, context) {
  if (!link || !context) return;
  if (!/^learn more$/i.test(link.textContent.trim())) return;
  if (link.querySelector('.visually-hidden')) return;
  const extra = document.createElement('span');
  extra.className = 'visually-hidden';
  extra.textContent = ` about ${context}`;
  link.append(extra);
}

function adoptIntroHeading(block, copy) {
  const section = block.closest('.section');
  const headingWrap = section?.querySelector(':scope > .default-content-wrapper');
  const heading = headingWrap?.querySelector('h3');
  if (!heading) return;
  copy.prepend(heading);
  if (!headingWrap.children.length) headingWrap.remove();
}

export default function decorate(block) {
  const items = [];
  const list = document.createElement('div');
  list.className = 'accordion-featured-list';
  const media = document.createElement('div');
  media.className = 'accordion-featured-media';

  [...block.children].forEach((row) => {
    const { imageCol, label, body } = parseRow(row);
    if (!label || !body) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-featured-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-featured-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-featured-item';
    details.append(summary, body);
    const labelText = summary.textContent.trim();
    body.querySelectorAll('a').forEach((link) => describeLearnMore(link, labelText));
    list.append(details);
    items.push(details);

    const mediaItem = document.createElement('div');
    mediaItem.className = 'accordion-featured-media-item';
    mediaItem.setAttribute('aria-hidden', 'true');
    const picture = imageCol?.querySelector('picture');
    if (picture) mediaItem.append(picture);
    media.append(mediaItem);
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const copy = document.createElement('div');
  copy.className = 'accordion-featured-copy';
  adoptIntroHeading(block, copy);
  copy.append(list);

  const hasMedia = [...media.children].some((el) => el.querySelector('picture'));
  if (hasMedia) block.replaceChildren(copy, media);
  else block.replaceChildren(copy);

  items.forEach((details, i) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        items.forEach((other) => {
          if (other !== details) other.open = false;
        });
        if (hasMedia) showMedia(media, i);
      } else if (!items.some((item) => item.open)) {
        details.open = true;
      }
    });
  });

  if (items.length) items[0].open = true;
}
