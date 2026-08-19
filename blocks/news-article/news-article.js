/*
 * News article — renders a GraphQL news item produced by JSON2HTML.
 * Initial structure is a key-value table (title, summary, read time,
 * publish date, slug, optional hero, body).
 */

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const LISTING_HREF = '/global/en/news';

function readRows(block) {
  const data = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent.replace(/\s+/g, '').toLowerCase();
    const value = row.children[1];
    if (key && value) data[key] = value;
  });
  return data;
}

function inferCategory(title, slug, summary) {
  const haystack = `${title || ''} ${slug || ''} ${summary || ''}`;
  if (/award/i.test(haystack)) return 'Awards';
  if (/event|expo|plma|trade show|join us/i.test(haystack)) return 'Events';
  return 'Blog';
}

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatReadTime(readTime) {
  if (!readTime) return '';
  return /read/i.test(readTime) ? readTime : `${readTime} read`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export default function decorate(block) {
  const rows = readRows(block);
  const titleCell = rows.title;
  const summaryCell = rows.summary;
  const bodyCell = rows.body;
  const heroCell = rows.hero;
  const heading = titleCell?.querySelector('h1') || titleCell;
  const titleText = heading?.textContent.trim() || '';
  const summaryText = summaryCell?.textContent.trim() || '';
  const slug = rows.slug?.textContent.trim() || '';
  const category = inferCategory(titleText, slug, summaryText);

  const nav = el('p', 'news-article-nav');
  const back = document.createElement('a');
  back.href = LISTING_HREF;
  back.textContent = 'Back';
  nav.append(back);

  const badge = el('p', 'news-article-category', category);

  if (heading && heading.tagName !== 'H1') {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    heading.replaceWith(h1);
  }

  const title = block.querySelector('h1') || el('h1', '', titleText);

  if (summaryCell) summaryCell.className = 'news-article-summary';

  const meta = el('p', 'news-article-meta');
  const readTime = formatReadTime(rows.readtime?.textContent.trim());
  const date = formatDate(rows.publishdate?.textContent.trim());
  meta.textContent = [readTime, date].filter(Boolean).join(' · ');

  if (heroCell) {
    heroCell.className = 'news-article-hero';
    const img = heroCell.querySelector('img');
    if (img && !img.getAttribute('src')) heroCell.remove();
  }

  if (bodyCell) bodyCell.className = 'news-article-body';

  const parts = [nav, badge, title];
  if (summaryCell) parts.push(summaryCell);
  if (meta.textContent) parts.push(meta);
  if (heroCell?.isConnected) parts.push(heroCell);
  if (bodyCell) parts.push(bodyCell);

  block.replaceChildren(...parts);
}
