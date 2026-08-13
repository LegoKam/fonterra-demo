/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-featured (base: accordion).
 * Source: https://www.nzmp.com/global/en.html (.verticalCarousel / .cmp-featured-tile)
 * Generated: 2026-08-13
 *
 * Container block, 2 columns per item row (per accordion library convention):
 *   Cell 1 -> summary (the clickable tile label/title)
 *   Cell 2 -> text (richtext body: description paragraph + "Learn more" CTA link)
 *
 * Each `.cmp-featured-tile__panel--body-tile` is one accordion item. The section heading
 * ("We can help you") lives inside the block root; it is intro content that is not part of
 * the accordion-featured-item model, so it is emitted as a default-content heading placed
 * immediately BEFORE the accordion block table (not inside a row).
 */
export default function parse(element, { document }) {
  const tiles = Array.from(element.querySelectorAll('.cmp-featured-tile__panel--body-tile'));

  // Intro heading ("We can help you"): preserve as default content before the block.
  const introHeading = element.querySelector('.headline, h1, h2, h3, h4');
  let headingEl = null;
  if (introHeading && introHeading.textContent.trim()) {
    const level = /^H[1-6]$/.test(introHeading.tagName) ? introHeading.tagName : 'H3';
    headingEl = document.createElement(level.toLowerCase());
    headingEl.textContent = introHeading.textContent.trim();
  }

  const cells = [];

  tiles.forEach((tile) => {
    // INPUT: label is the button text inside the tile's heading.
    const labelBtn = tile.querySelector('.cmp-featured-tile__panel--body-btn, h2 button, button');
    const summaryText = labelBtn ? labelBtn.textContent.trim() : '';

    // INPUT: body = description paragraph(s) + CTA link.
    const desc = tile.querySelector('.copy p, .copy, .cmp-featured-tile__panel--body__wrapper p');
    const cta = tile.querySelector('.button-link a, a.nzmpNewArrowLink, a');

    if (!summaryText && !desc && !cta) return;

    // Cell 1: summary (plain text label). Rebuild as a clean text node so button/icon markup
    // does not leak into the summary cell.
    const summaryCell = [
      document.createComment(' field:summary '),
      document.createTextNode(summaryText),
    ];

    // Cell 2: text (richtext grouping description + CTA)
    const textCell = [document.createComment(' field:text ')];
    if (desc && desc.textContent.trim()) textCell.push(desc);
    if (cta) {
      // Strip trailing icon markup so the link renders as clean "Learn more" text.
      cta.querySelectorAll('em, i, svg').forEach((icon) => icon.remove());
      textCell.push(cta);
    }

    cells.push([summaryCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-featured', cells });

  // Emit the intro heading as default content immediately before the block table.
  if (headingEl) {
    element.replaceWith(headingEl, block);
  } else {
    element.replaceWith(block);
  }
}
