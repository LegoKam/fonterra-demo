/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-value (base: cards / container block).
 * Source: https://www.nzmp.com/global/en/about-nzmp/global-ingredients.html
 *         (.multicolumn-grid:not(:has(.cmp-multicolumn-grid__headline)))
 * Generated: 2026-08-13
 *
 * Row of text-only value-prop cards. Each populated `.multi-col` becomes one row per
 * the `card` model (2 cells):
 *   Cell 1 -> image (field:image) — EMPTY for these text-only cards, but the cell is
 *             still emitted per the Cards convention.
 *   Cell 2 -> text (field:text) richtext: title (h3) + description (p).
 *
 * DEFENSIVE: cards-value and cards-category both originate from `.multicolumn-grid`.
 * If this element HAS a `.cmp-multicolumn-grid__headline`, it is a cards-category
 * grid — bail out so it is not double-parsed.
 */
export default function parse(element, { document }) {
  // Defensive disambiguation: a headline means this is a cards-category grid.
  if (element.querySelector('.cmp-multicolumn-grid__headline')) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // INPUT: each populated column is a value card. Skip empty layout columns.
  const cols = Array.from(element.querySelectorAll('.multi-col'))
    .filter((col) => col.textContent.trim());

  const cells = [];

  cols.forEach((col) => {
    // Title (h3) and description richtext blocks (each `.richtext` that is not the title).
    const title = col.querySelector('h3, h2, h4, .title');
    const richBlocks = Array.from(col.querySelectorAll('.richtext'));
    const descriptions = richBlocks.filter((d) => d.textContent.trim() && !d.contains(title));

    // Cell 1: image — text-only cards have none; emit an empty cell (no hint).
    const imageCell = '';

    // Cell 2: text (field:text) grouping title + descriptions.
    const textNodes = [document.createComment(' field:text ')];
    if (title) textNodes.push(title);
    descriptions.forEach((d) => textNodes.push(d));

    if (title || descriptions.length) {
      cells.push([imageCell, textNodes]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-value', cells });
  element.replaceWith(block);
}
