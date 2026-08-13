/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form (base form block — no variant model in this project).
 * Source: https://www.nzmp.com/global/en.html (.emailsubscription.esBar)
 * Generated: 2026-08-13
 *
 * The source is an email-subscription newsletter form (heading + first name / last name /
 * email inputs + consent checkbox + submit button). There is no `blocks/form` model here,
 * so this is a best-effort parser: it captures the human-authorable content (the heading and
 * each field's label) as a single-column `form` block so the intent survives the import.
 * Runtime-only concerns (captcha iframe, hidden inputs, loading spinner, success/try-again
 * modal) are intentionally dropped — they are not authorable content.
 */
export default function parse(element, { document }) {
  const contentCell = [];

  // Heading / intro copy.
  const title = element.querySelector('.emailsubscription__title, h2');
  if (title && title.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = title.textContent.trim();
    contentCell.push(h);
  }

  // Field labels: the floating-label text inputs (first name / last name / email).
  // Scoped to `.input-label` so the consent checkbox label (handled separately below) is
  // not duplicated into this list.
  const labels = Array.from(element.querySelectorAll('.form-group .input-label'))
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 0);

  // Consent checkbox label (may contain links to privacy / T&Cs — preserve them as richtext).
  const consent = element.querySelector('.checkbox-label, .form-group--checkbox label');

  // Submit button label.
  const submit = element.querySelector('.send-button span, .send-button, button[type="submit"], .form-group--submit-btn button');
  const submitText = submit ? submit.textContent.replace(/\s+/g, ' ').trim() : '';

  // Render fields as a simple list so authors see the form's shape.
  if (labels.length) {
    const ul = document.createElement('ul');
    labels.forEach((labelText) => {
      const li = document.createElement('li');
      li.textContent = labelText;
      ul.appendChild(li);
    });
    contentCell.push(ul);
  }

  if (consent && consent.textContent.trim()) {
    const p = document.createElement('p');
    // Keep any privacy/T&C anchors intact inside the consent paragraph.
    p.append(...consent.cloneNode(true).childNodes);
    contentCell.push(p);
  }

  if (submitText) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = submitText;
    p.appendChild(strong);
    contentCell.push(p);
  }

  // Post-submit confirmation copy ("Thank you!" + follow-up message). Authorable content,
  // even though it is hidden until the form is submitted at runtime.
  const result = element.querySelector('.result.modalEmailSubscription, .result');
  if (result) {
    const confirmTitle = result.querySelector('.title h3, h3');
    if (confirmTitle && confirmTitle.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = confirmTitle.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(h);
    }
    const confirmMsg = result.querySelector('.title p, p');
    if (confirmMsg && confirmMsg.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = confirmMsg.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(p);
    }
  }

  // Empty-block guard.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column block: one row whose single cell holds all elements.
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
