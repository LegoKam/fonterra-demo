import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorates the default content in the footer fragment.
 * @param {Element} footer The loaded footer fragment
 */
function decorateFooterContent(footer) {
  const content = footer.querySelector('.default-content-wrapper');
  if (!content) return;

  content.classList.add('footer-content');

  const logo = content.querySelector('picture');
  const brand = logo?.closest('p');
  brand?.classList.add('footer-brand');

  const navigation = content.querySelector('ul');
  navigation?.classList.add('footer-navigation');

  const legal = [...content.children]
    .find((element) => element.tagName === 'P' && element !== brand);
  legal?.classList.add('footer-legal');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateFooterContent(footer);

  block.append(footer);
}
