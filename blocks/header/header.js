import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// delay before closing a hovered-open drop, so briefly crossing the gap
// between a trigger and its flyout panel doesn't collapse the mega nav
const HOVER_CLOSE_DELAY = 200;
const closeTimers = new WeakMap();

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Collapses every sibling of item (and their nested drops), leaving item's
 * own expanded state untouched.
 * @param {Element} item The nav-drop <li> whose siblings should close
 */
function collapseSiblingDrops(item) {
  [...item.parentElement.children].forEach((sibling) => {
    if (sibling === item) return;
    sibling.setAttribute('aria-expanded', 'false');
    sibling.querySelectorAll('.nav-drop').forEach((d) => d.setAttribute('aria-expanded', 'false'));
  });
}

/**
 * Opens a nav-drop, cancelling any pending hover-close and closing its
 * siblings so only one branch of the mega nav is open at a time.
 * @param {Element} item The nav-drop <li> to open
 */
function openDrop(item) {
  clearTimeout(closeTimers.get(item));
  collapseSiblingDrops(item);
  item.setAttribute('aria-expanded', 'true');
}

/**
 * Closes a nav-drop and any of its own open descendants.
 * @param {Element} item The nav-drop <li> to close
 */
function closeDrop(item) {
  clearTimeout(closeTimers.get(item));
  item.setAttribute('aria-expanded', 'false');
  item.querySelectorAll('.nav-drop').forEach((d) => d.setAttribute('aria-expanded', 'false'));
}

/**
 * Schedules a nav-drop to close after HOVER_CLOSE_DELAY, so quickly moving
 * the pointer from the trigger into its flyout panel doesn't flicker shut.
 * @param {Element} item The nav-drop <li> to close
 */
function scheduleClose(item) {
  clearTimeout(closeTimers.get(item));
  closeTimers.set(item, setTimeout(() => closeDrop(item), HOVER_CLOSE_DELAY));
}

/**
 * Builds the drill-down header (back button, close button, screen title)
 * shown at the top of a nav-drop's submenu on mobile, where each level
 * takes over the full screen instead of flying out beside its trigger.
 * @param {Element} item The nav-drop <li> the submenu belongs to
 * @returns {Element} A <li> ready to be prepended to the submenu
 */
function buildDrilldownHeader(item) {
  const trigger = item.querySelector(':scope > p, :scope > a');
  const header = document.createElement('li');
  header.className = 'nav-drop-header';
  header.innerHTML = `
    <div class="nav-drop-header-bar">
      <button type="button" class="nav-drop-back" aria-label="Back">
        <span class="nav-drop-back-icon"></span>
      </button>
      <button type="button" class="nav-drop-close" aria-label="Close navigation">
        <span class="nav-drop-close-icon"></span>
      </button>
    </div>
    <p class="nav-drop-title"></p>
  `;
  header.querySelector('.nav-drop-title').textContent = trigger ? trigger.textContent.trim() : '';
  header.querySelector('.nav-drop-back').addEventListener('click', (e) => {
    // go up one level, back to whichever screen was showing before this one
    e.stopPropagation();
    closeDrop(item);
  });
  header.querySelector('.nav-drop-close').addEventListener('click', (e) => {
    // dismiss the whole mobile nav, however many levels deep we are
    e.stopPropagation();
    item.closest('#nav').querySelector('.nav-hamburger button').click();
  });
  return header;
}

/**
 * Recursively marks any <li> that contains a nested <ul> as a nav-drop,
 * wiring up hover and click behavior so the mega nav can cascade to any
 * depth in a stable way.
 * @param {Element} ul The list whose direct children should be decorated
 */
function decorateNavDrops(ul) {
  ul.querySelectorAll(':scope > li').forEach((item) => {
    const submenu = item.querySelector(':scope > ul');
    if (!submenu) return;
    item.classList.add('nav-drop');
    item.setAttribute('aria-expanded', 'false');
    // on mobile the submenu becomes a full-screen drill-down panel; this
    // header (hidden on desktop) gives it a way back and a way to close
    submenu.prepend(buildDrilldownHeader(item));

    // click drives both the mobile drill-down and (together with hover,
    // below) the desktop mega menu
    item.addEventListener('click', (e) => {
      // only react to clicks aimed at this level, not a nested nav-drop
      if (e.target.closest('.nav-drop') !== item) return;
      const expanded = item.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDrop(item);
      } else {
        // this item may also be a real link: the first click only reveals
        // the mega menu instead of navigating away, so hover/click stay in
        // sync and clicking never yanks the page out from under the menu
        e.preventDefault();
        e.stopPropagation();
        openDrop(item);
      }
    });

    // hover-intent: open immediately, but close on a short delay so the
    // (visual, not DOM) gap between a trigger and its panel can be crossed
    item.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      openDrop(item);
    });
    item.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      scheduleClose(item);
    });

    decorateNavDrops(submenu);
  });
}

/**
 * Toggles all nav sections, at every nesting level
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .nav-drop').forEach((drop) => {
    drop.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // always start from the root screen: individual nav-drops open on their
  // own via click/hover, so opening (or closing) the whole mobile nav
  // should never leave (or land on) some previously drilled-down branch
  toggleAllNavSections(navSections, 'false');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // turn authored icon spans (e.g. the search icon) into actual <img>s
  decorateIcons(nav);

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // drop redundant title attributes (title === link text) so the native
    // browser tooltip doesn't pop up over the mega nav on hover
    navSections.querySelectorAll('a[title]').forEach((a) => {
      if (a.title.trim().toLowerCase() === a.textContent.trim().toLowerCase()) {
        a.removeAttribute('title');
      }
    });
    const topLevelList = navSections.querySelector(':scope .default-content-wrapper > ul');
    if (topLevelList) decorateNavDrops(topLevelList);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
