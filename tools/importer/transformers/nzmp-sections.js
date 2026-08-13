/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NZMP section boundaries + section metadata.
 *
 * Runs in beforeTransform (NOT afterTransform). The section anchors for
 * single-block sections (`.verticalCarousel`, `.emailsubscription.esBar`) are the
 * exact elements the block parsers replace via element.replaceWith(); if this
 * transformer ran afterTransform those anchors would already be gone and their
 * section breaks/metadata would be skipped, collapsing them into the previous
 * section. Running beforeTransform inserts the <hr> breaks and Section Metadata
 * blocks while every original anchor still exists. The inserted <hr>/metadata are
 * plain siblings the parsers never touch (parsers querySelector within their own
 * block element), so they survive parsing intact.
 *
 * For each section (processed in reverse so earlier insertions do not shift the
 * DOM positions of not-yet-processed sections):
 *   - inserts a section break (<hr>) before the section anchor for every
 *     non-first section (expected: sections.length - 1 = 4 breaks);
 *   - creates a Section Metadata block after the section anchor when the
 *     section has a `style` (expected: 2 blocks -> section-2 "dark-blue",
 *     section-5 "blue").
 *
 * Section anchor selectors come from tools/importer/page-templates.json and
 * were verified against migration-work/cleaned.html:
 *   section-1  .homeBanner__container                          (L1501)
 *   section-2  .horizontalCategoryCarousel.duskBlue (L1632),
 *              fallback .pageTeaser.list.parbase               (L1631)
 *   section-3  .verticalCarousel                               (L1872)
 *   section-4  .responsivegrid-centered                        (L1959)
 *   section-5  .emailsubscription.esBar                        (L2938)
 *
 * A section's `selector` may be a string or an array of strings. Arrays list
 * the primary block selector first and a stable wrapper fallback second, so
 * the anchor still resolves in the real import flow where a block parser may
 * have already replaced the primary element with a table before this hook runs.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Resolve a section's anchor element from a selector that may be a string or
 * an array of selectors. Returns the first element that currently matches.
 */
function resolveSectionElement(element, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const found = element.querySelector(sel);
    if (found) return found;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;

    const { document } = payload;

    // Process in reverse order for insertion stability.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section) continue;

      const anchor = resolveSectionElement(element, section.selector);
      if (!anchor || !anchor.parentNode) continue;

      // Section Metadata block for styled sections, placed after the section
      // anchor so it belongs to this section (before the next section break).
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        anchor.parentNode.insertBefore(metadataBlock, anchor.nextSibling);
      }

      // Section break before every non-first section.
      if (i > 0) {
        const hr = document.createElement('hr');
        anchor.parentNode.insertBefore(hr, anchor);
      }
    }
  }
}
