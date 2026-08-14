/* eslint-disable */
/**
 * extract-news-cf.js
 *
 * Fetches each NZMP news article and extracts structured Content Fragment data
 * (title, summary, publishDate, readTime, category, tags, heroImage, body,
 * sourceUrl, slug) into migration-work/news-cf/news-articles.json.
 *
 * Regex-based (no jsdom in this environment). Run:
 *   node tools/importer/extract-news-cf.js [urlsFile] [--limit N] [--concurrency N]
 */
const fs = require('fs');
const path = require('path');

const URLS_FILE = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : 'migration-work/url-discovery/news-articles.txt';
const argLimit = process.argv.indexOf('--limit');
const LIMIT = argLimit > -1 ? parseInt(process.argv[argLimit + 1], 10) : Infinity;
const argConc = process.argv.indexOf('--concurrency');
const CONCURRENCY = argConc > -1 ? parseInt(process.argv[argConc + 1], 10) : 6;
const OUT_DIR = 'migration-work/news-cf';
const OUT_FILE = path.join(OUT_DIR, 'news-articles.json');
const CATS_FILE = path.join(OUT_DIR, 'categories-observed.json');

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function decode(s) {
  return (s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function meta(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? decode(m[1]) : '';
}

function absUrl(u) {
  if (!u) return '';
  if (u.startsWith('http')) return u;
  if (u.startsWith('/')) return `https://www.nzmp.com${u}`;
  return u;
}

function parseDate(raw) {
  // "20 Dec 2022" -> "2022-12-20"
  const m = (raw || '').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return '';
  const mm = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (!mm) return '';
  return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
}

function extract(html, url) {
  const slug = url.replace(/\.html?$/, '').replace(/\/$/, '').split('/').pop();

  // Title: prefer on-page H1, fall back to og:title
  let title = '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) title = decode(h1[1].replace(/<[^>]+>/g, ''));
  if (!title) title = meta(html, 'og:title') || meta(html, 'title');

  // Summary: the .copy intro paragraph near the H1, else description meta
  let summary = '';
  const copy = html.match(/class="copy clearfix[^"]*"[\s\S]{0,400}?<p>([\s\S]*?)<\/p>/i);
  if (copy) summary = decode(copy[1].replace(/<[^>]+>/g, ''));
  if (!summary) summary = meta(html, 'og:description') || meta(html, 'description');

  // Date + read time (inside .date / .location blocks)
  const dateRaw = (html.match(/class="date">\s*<p>[\s\S]*?<\/i>\s*([^<]+)</i) || [])[1] || '';
  const publishDate = parseDate(dateRaw);
  const readTime = decode((html.match(/class="location">\s*<p>[\s\S]*?<\/i>\s*([^<]+)</i) || [])[1] || '');

  // Tags: all .tags__item
  const tags = [...html.matchAll(/tags__item">\s*([^<]+?)\s*</g)]
    .map((m) => decode(m[1]).replace(/^#/, ''))
    .filter((t) => t && !/^all categories$/i.test(t));
  // Category: first meaningful tag (Blog/Awards/Events/News/Insights) else first tag
  const KNOWN = ['Blog', 'Awards', 'Events', 'News', 'Insights'];
  const category = tags.find((t) => KNOWN.some((k) => k.toLowerCase() === t.toLowerCase())) || tags[0] || '';

  // Hero image: imageTextIntroBanner background-image, else og:image
  let heroImage = '';
  const heroIdx = html.indexOf('imageTextIntroBanner');
  if (heroIdx > -1) {
    const seg = html.slice(heroIdx, heroIdx + 2500);
    const bg = seg.match(/background-image:\s*url\((["']?)([^"')]+)\1\)/i);
    const img = seg.match(/<img[^>]+src="([^"]+)"/i);
    heroImage = (bg && bg[2]) || (img && img[1]) || '';
  }
  if (!heroImage) heroImage = meta(html, 'og:image');
  heroImage = absUrl(heroImage);

  // Body: concatenate the article richtext blocks (preserve inner HTML).
  const bodyParts = [...html.matchAll(/class="richtext text parbase[^"]*">([\s\S]*?)<\/div>/g)]
    .map((m) => m[1].trim())
    // drop empty authoring placeholders (<p data-emptytext>) and nav-only richtext
    .filter((s) => s && s.replace(/<[^>]+>/g, '').trim().length > 0);
  let body = bodyParts.join('\n');
  // Fallback for content-thin/archived stubs whose on-page body is an empty
  // authoring placeholder: use the summary/description so the CF isn't bodyless.
  let bodyFallback = false;
  if (!body || body.replace(/<[^>]+>/g, '').trim().length < 20) {
    if (summary) { body = `<p>${summary}</p>`; bodyFallback = true; }
  }

  return {
    title,
    summary,
    publishDate,
    readTime,
    category,
    tags,
    heroImage,
    body,
    bodyFallback,
    sourceUrl: url,
    slug,
  };
}

async function fetchWithRetry(url, tries = 3) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NZMP-CF-Extract/1.0)' },
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) return await res.text();
    } catch (e) { /* retry */ }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const urls = fs.readFileSync(URLS_FILE, 'utf8').split('\n').map((s) => s.trim())
    .filter(Boolean).slice(0, LIMIT);
  console.log(`Extracting ${urls.length} news articles (concurrency ${CONCURRENCY})...`);

  const results = [];
  const failures = [];
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const myIdx = idx;
      idx += 1;
      const url = urls[myIdx];
      const html = await fetchWithRetry(url);
      if (!html) { failures.push(url); console.log(`  [${myIdx + 1}/${urls.length}] FAILED ${url}`); continue; }
      const data = extract(html, url);
      results.push(data);
      if ((myIdx + 1) % 25 === 0 || myIdx === urls.length - 1) {
        console.log(`  [${myIdx + 1}/${urls.length}] ok (${data.title.slice(0, 40)})`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  results.sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

  const cats = {};
  results.forEach((r) => { if (r.category) cats[r.category] = (cats[r.category] || 0) + 1; });
  fs.writeFileSync(CATS_FILE, JSON.stringify(cats, null, 2));

  console.log(`\nDone. ${results.length} articles → ${OUT_FILE}`);
  console.log(`Failures: ${failures.length}`);
  if (failures.length) fs.writeFileSync(path.join(OUT_DIR, 'failures.txt'), failures.join('\n'));
  console.log(`Categories: ${JSON.stringify(cats)}`);
}

main();
