/*
 * Newsfeed — paginated article listing from AEM Content Fragment GraphQL.
 * Layout: featured row, then a 2-up row, then 3-up cards, with category
 * filter, sort, and numbered pagination.
 */

const GRAPHQL_ENDPOINT = 'https://publish-p152232-e1579634.adobeaemcloud.com/graphql/execute.json/fonterra-demo/paginate-list';
const FETCH_LIMIT = 100;
const DEFAULT_PAGE_SIZE = 6;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const CATEGORIES = ['Awards', 'Events', 'Blog'];

function readConfig(block) {
  const cfg = { title: 'Newsfeed', pagesize: DEFAULT_PAGE_SIZE };
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent.replace(/\s+/g, '').toLowerCase();
    const value = row.children[1]?.textContent.trim();
    if (!key || !value) return;
    if (key === 'title') cfg.title = value;
    if (key === 'pagesize' || key === 'limit') {
      const size = parseInt(value, 10);
      if (size > 0) cfg.pagesize = size;
    }
  });
  return cfg;
}

function resolveImage(heroImage) {
  if (!heroImage) return '';
  if (typeof heroImage === 'string') return heroImage;
  /* AEM GraphQL image refs use underscore-prefixed URLs */
  /* eslint-disable no-underscore-dangle */
  const url = heroImage._publishUrl || heroImage._dynamicUrl || heroImage.src || '';
  /* eslint-enable no-underscore-dangle */
  return url;
}

function inferCategory(item) {
  const haystack = `${item.title || ''} ${item.slug || ''} ${item.summary?.plaintext || ''}`;
  if (/award/i.test(haystack)) return 'Awards';
  if (/event|expo|plma|trade show|join us/i.test(haystack)) return 'Events';
  return 'Blog';
}

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatReadTime(readTime) {
  if (!readTime) return '';
  return /read/i.test(readTime) ? readTime : `${readTime} read`;
}

function normalize(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    summary: item.summary?.plaintext || '',
    date: formatDate(item.publishDate),
    readTime: formatReadTime(item.readTime),
    category: item.category || inferCategory(item),
    image: resolveImage(item.heroImage),
    href: item.slug ? `/global/en/news/${item.slug}` : '',
    published: item.publishDate ? Date.parse(item.publishDate) : 0,
  };
}

async function fetchArticles() {
  const url = `${GRAPHQL_ENDPOINT};limit=${FETCH_LIMIT};offset=0`;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`Newsfeed request failed (${res.status})`);
  const json = await res.json();
  const items = json?.data?.newsArticleList?.items;
  if (!Array.isArray(items)) throw new Error('Newsfeed response was empty');
  return items.map(normalize);
}

async function loadFallbackImages() {
  try {
    const res = await fetch('/global/en.plain.html');
    if (!res.ok) return {};
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = {};
    doc.querySelectorAll('.carousel-news > div').forEach((row) => {
      const img = row.querySelector('img');
      const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
      if (img?.src && heading) images[heading.textContent.trim()] = img.src;
    });
    return images;
  } catch {
    return {};
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function pageWindow(current, total, size = 5) {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(size / 2));
  let end = start + size - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, total - size + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function createCard(article, featured) {
  const card = el('article', `newsfeed-card${featured ? ' newsfeed-card-featured' : ''}`);

  const image = el('div', 'newsfeed-card-image');
  if (article.image) {
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.loading = featured ? 'eager' : 'lazy';
    image.append(img);
  }
  if (article.category) {
    image.append(el('span', 'newsfeed-card-category', article.category));
  }

  const body = el('div', 'newsfeed-card-body');
  if (article.readTime) body.append(el('p', 'newsfeed-card-readtime', article.readTime));

  const heading = el('h3', 'newsfeed-card-title');
  if (article.href) {
    const link = document.createElement('a');
    link.href = article.href;
    link.textContent = article.title;
    heading.append(link);
  } else {
    heading.textContent = article.title;
  }
  body.append(heading);
  if (article.date) body.append(el('p', 'newsfeed-card-date', article.date));

  card.append(image, body);
  return card;
}

function createSelect(className, label, options, selected) {
  const select = el('select', className);
  select.setAttribute('aria-label', label);
  options.forEach(({ value, text }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    if (value === selected) option.selected = true;
    select.append(option);
  });
  return select;
}

export default async function decorate(block) {
  const cfg = readConfig(block);
  const state = {
    articles: [],
    page: 1,
    pagesize: cfg.pagesize,
    category: '',
    sort: 'latest',
  };

  const root = el('div', 'newsfeed-inner');
  const header = el('div', 'newsfeed-header');
  header.append(el('h2', 'newsfeed-title', cfg.title));

  const toolbar = el('div', 'newsfeed-toolbar');
  const filter = createSelect(
    'newsfeed-select',
    'Select filters',
    [
      { value: 'all', text: 'Select filters' },
      ...CATEGORIES.map((cat) => ({ value: cat, text: cat })),
    ],
    'all',
  );
  const sort = createSelect(
    'newsfeed-select',
    'Sort articles',
    [
      { value: 'latest', text: 'Latest' },
      { value: 'oldest', text: 'Oldest' },
    ],
    'latest',
  );
  toolbar.append(filter, sort);
  header.append(toolbar);

  const grid = el('div', 'newsfeed-grid');
  grid.setAttribute('aria-live', 'polite');
  const pager = el('nav', 'newsfeed-pagination');
  pager.setAttribute('aria-label', 'Newsfeed pagination');
  const status = el('p', 'newsfeed-status', 'Loading articles…');

  root.append(header, status, grid, pager);
  block.replaceChildren(root);

  function visibleArticles() {
    let list = state.articles;
    if (state.category && state.category !== 'all') {
      list = list.filter((item) => item.category === state.category);
    }
    list = [...list].sort((a, b) => (
      state.sort === 'oldest' ? a.published - b.published : b.published - a.published
    ));
    return list;
  }

  function render() {
    const list = visibleArticles();
    const pageCount = Math.max(1, Math.ceil(list.length / state.pagesize));
    if (state.page > pageCount) state.page = pageCount;
    const start = (state.page - 1) * state.pagesize;
    const pageItems = list.slice(start, start + state.pagesize);

    status.hidden = true;
    grid.replaceChildren();
    pageItems.forEach((article, index) => {
      grid.append(createCard(article, index === 0));
    });
    if (!pageItems.length) {
      status.hidden = false;
      status.textContent = 'No articles found.';
    }

    pager.replaceChildren();
    pager.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    const listEl = el('ol', 'newsfeed-page-list');
    pageWindow(state.page, pageCount).forEach((page) => {
      const item = document.createElement('li');
      const btn = el('button', 'newsfeed-page', String(page));
      btn.type = 'button';
      if (page === state.page) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'page');
      }
      btn.addEventListener('click', () => {
        state.page = page;
        render();
      });
      item.append(btn);
      listEl.append(item);
    });
    pager.append(listEl);

    if (state.page < pageCount) {
      const next = el('button', 'newsfeed-next', 'Next >');
      next.type = 'button';
      next.addEventListener('click', () => {
        state.page += 1;
        render();
      });
      pager.append(next);
    }
  }

  filter.addEventListener('change', () => {
    state.category = filter.value;
    state.page = 1;
    render();
  });
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    state.page = 1;
    render();
  });

  try {
    state.articles = await fetchArticles();
    const fallbackImages = await loadFallbackImages();
    state.articles.forEach((article) => {
      if (!article.image && fallbackImages[article.title]) {
        article.image = fallbackImages[article.title];
      }
    });
    render();
  } catch (err) {
    status.hidden = false;
    status.textContent = 'News articles could not be loaded.';
    // eslint-disable-next-line no-console
    console.error(err);
  }
}
