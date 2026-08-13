import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Finds the slide whose horizontal center is closest to the track's center.
 * @param {Element} track the scrolling slides container
 * @returns {number} index of the centered slide
 */
function getCenteredIndex(track) {
  const slides = [...track.querySelectorAll('.carousel-category-slide')];
  const trackCenter = track.scrollLeft + track.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;
  slides.forEach((slide, idx) => {
    const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
    const dist = Math.abs(slideCenter - trackCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
  });
  return best;
}

/**
 * Marks the given slide index as the active (center-emphasised) one:
 * reveals its description + CTA and keeps hidden links out of the tab order.
 */
function updateActiveSlide(block, slideIndex) {
  if (block.dataset.activeSlide === String(slideIndex)) return;
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-category-slide');
  slides.forEach((slide, idx) => {
    const isActive = idx === slideIndex;
    slide.classList.toggle('carousel-category-slide-active', isActive);
    // Description + CTA links only render on the active card, so keep the
    // links of non-active cards out of the keyboard tab order.
    slide.querySelectorAll('.carousel-category-slide-body a').forEach((link) => {
      if (isActive) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
}

/**
 * Scrolls the track so that the slide at slideIndex is centered.
 */
export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const track = block.querySelector('.carousel-category-slides');
  const slides = track.querySelectorAll('.carousel-category-slide');
  let realIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realIndex = 0;
  const slide = slides[realIndex];
  const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
  track.scrollTo({ left, behavior });
}

function bindEvents(block) {
  const track = block.querySelector('.carousel-category-slides');

  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  // Track which card is centered as the user scrolls / drags.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveSlide(block, getCenteredIndex(track));
      ticking = false;
    });
  };
  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => updateActiveSlide(block, getCenteredIndex(track)));
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-category-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-category-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const content = slide.querySelector('.carousel-category-slide-content');
  if (content) {
    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    // Everything below the title (description + CTA) is grouped so it can be
    // revealed only on the active/center card, matching the source.
    const body = document.createElement('div');
    body.classList.add('carousel-category-slide-body');
    [...content.children].forEach((child) => {
      if (child !== heading) body.append(child);
    });
    if (body.childElementCount) content.append(body);

    // Tag the CTA link so it renders as the white "Explore" pill.
    const cta = body.querySelector('a');
    if (cta) {
      cta.classList.add('carousel-category-cta');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('carousel-category-cta-container');
    }
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy && labeledBy.id) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-category-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-category-slides');

  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-category-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  // Establish initial active (centered) card once layout has settled. With 3+
  // slides, start centered on the second card so a full card sits either side
  // of the active one — mirroring the source's centre-mode 3-up layout (the
  // source fills the flanks with cloned slides, which EDS content cannot).
  const startIndex = rows.length >= 3 ? 1 : 0;
  requestAnimationFrame(() => {
    if (startIndex > 0) showSlide(block, startIndex, 'auto');
    updateActiveSlide(block, getCenteredIndex(slidesWrapper));
  });
}
