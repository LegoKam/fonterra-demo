/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb (structural block).
 * Source: https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html (.comp__breadcrumbs)
 * Generated: 2026-08-13
 *
 * Best-effort structural parser. Captures the ordered hierarchical links from
 * `ol.breadcrumb > li` into a single-column block cell as a `<ul>` of anchors.
 * The last (active) crumb has no link and is emitted as plain text.
 * No block model exists for breadcrumb, so no field hints are added.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('ol.breadcrumb > li, .breadcrumb > li'));

  const list = document.createElement('ul');

  items.forEach((li) => {
    const anchor = li.querySelector('a[href]');
    const outLi = document.createElement('li');
    if (anchor) {
      // Text: home crumb uses a hidden "Home" span, others use a visible span.
      const label = anchor.textContent.trim() || anchor.getAttribute('title') || '';
      const a = document.createElement('a');
      a.setAttribute('href', anchor.getAttribute('href'));
      a.textContent = label;
      outLi.appendChild(a);
    } else {
      // Active/current crumb: no link, plain text.
      const label = (li.textContent || '').trim();
      outLi.textContent = label;
    }
    if (outLi.textContent.trim()) list.appendChild(outLi);
  });

  // Empty-block guard.
  if (!list.childNodes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column block: one row, one cell holding the breadcrumb list.
  const cells = [[[list]]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  element.replaceWith(block);
}
