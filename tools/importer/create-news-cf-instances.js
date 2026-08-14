/* eslint-disable */
/**
 * create-news-cf-instances.js
 *
 * Creates AEM Content Fragment instances for the 315 NZMP news articles from
 * migration-work/news-cf/news-articles.json, against the fonterra-demo AEM Cloud
 * Service AUTHOR instance, using the AEM Assets HTTP API.
 *
 * PREREQUISITES (author-side, done by you):
 *   1. The `News Article` CF Model must already exist in AEM CS. Its model path
 *      (e.g. /conf/fonterra-demo/settings/dam/cfm/models/news-article) is passed
 *      via --model.
 *   2. Adobe credentials opt-in must be enabled in Settings ("Allow LLM to use my
 *      Adobe credentials ...") so the Authorization header is injected automatically.
 *      This script NEVER takes or embeds a token.
 *
 * USAGE:
 *   node tools/importer/create-news-cf-instances.js \
 *     --model /conf/fonterra-demo/settings/dam/cfm/models/news-article \
 *     [--author https://author-p152232-e1579634.adobeaemcloud.com] \
 *     [--parent /content/dam/fonterra-demo/news] \
 *     [--limit N] [--dry-run]
 *
 * Start with --dry-run (default) to preview payloads without writing. Add
 * --commit to actually POST. Re-runnable: existing fragments are skipped (checked
 * via GET) unless --overwrite is passed.
 */
const fs = require('fs');

const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return (v && !v.startsWith('--')) ? v : true;
}

const DATA_FILE = 'migration-work/news-cf/news-articles.json';
const AUTHOR = (opt('author', 'https://author-p152232-e1579634.adobeaemcloud.com')).replace(/\/$/, '');
const MODEL = opt('model', null); // required to commit
const PARENT = (opt('parent', '/content/dam/fonterra-demo/news')).replace(/\/$/, '');
const LIMIT = opt('limit', null) ? parseInt(opt('limit'), 10) : Infinity;
const COMMIT = args.includes('--commit');
const OVERWRITE = args.includes('--overwrite');
const CONCURRENCY = opt('concurrency', null) ? parseInt(opt('concurrency'), 10) : 4;

// Map a CF-data record to the AEM Assets API "create content fragment" payload.
// Field property names must match the CF Model field names in cf-model-spec.md.
function toPayload(rec) {
  return {
    properties: {
      cq_model: MODEL,
      title: rec.title || rec.slug,
      description: rec.summary || '',
      elements: {
        title: { value: rec.title || '' },
        summary: { value: rec.summary || '' },
        publishDate: rec.publishDate ? { value: rec.publishDate } : undefined,
        readTime: { value: rec.readTime || '' },
        category: { value: rec.category || '' },
        tags: { value: rec.tags || [] },
        heroImage: { value: rec.heroImage || '' },
        // body is rich text — send as text/html so the CF rich-text element stores markup.
        body: { value: rec.body || '', 'sling:resourceType': 'dam/cfm/models/console/components/data/element/richtext' },
        sourceUrl: { value: rec.sourceUrl || '' },
        slug: { value: rec.slug || '' },
      },
    },
  };
}

function cfUrl(slug) {
  // AEM Assets API path for a content fragment under the parent folder.
  return `${AUTHOR}/api/assets${PARENT}/${slug}`;
}

async function exists(slug) {
  try {
    const res = await fetch(`${cfUrl(slug)}.json`, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    return res.ok;
  } catch (e) { return false; }
}

async function createOne(rec) {
  const payload = toPayload(rec);
  if (!COMMIT) {
    return { slug: rec.slug, status: 'dry-run', chars: JSON.stringify(payload).length };
  }
  if (!OVERWRITE && await exists(rec.slug)) {
    return { slug: rec.slug, status: 'skipped-exists' };
  }
  try {
    // Authorization header is injected by the environment when the opt-in is enabled.
    const res = await fetch(cfUrl(rec.slug), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });
    if (res.status === 401 || res.status === 403) {
      return { slug: rec.slug, status: `auth-error-${res.status}` };
    }
    if (!res.ok) return { slug: rec.slug, status: `http-${res.status}` };
    return { slug: rec.slug, status: 'created' };
  } catch (e) {
    return { slug: rec.slug, status: `error:${e.message}` };
  }
}

async function main() {
  const records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).slice(0, LIMIT);
  console.log(`CF import: ${records.length} articles`);
  console.log(`  author:  ${AUTHOR}`);
  console.log(`  parent:  ${PARENT}`);
  console.log(`  model:   ${MODEL || '(NOT SET — required for --commit)'}`);
  console.log(`  mode:    ${COMMIT ? 'COMMIT' : 'DRY-RUN (pass --commit to write)'}`);
  if (COMMIT && !MODEL) {
    console.error('\n❌ --model is required to commit. Aborting.');
    process.exit(1);
  }

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < records.length) {
      const rec = records[idx];
      idx += 1;
      const r = await createOne(rec);
      results.push(r);
      if (results.length % 25 === 0 || results.length === records.length) {
        console.log(`  ${results.length}/${records.length} (last: ${r.slug} → ${r.status})`);
      }
    }
  }
  await Promise.all(Array.from({ length: COMMIT ? CONCURRENCY : 1 }, () => worker()));

  const byStatus = {};
  results.forEach((r) => { byStatus[r.status.replace(/:.*/, '')] = (byStatus[r.status.replace(/:.*/, '')] || 0) + 1; });
  console.log(`\nSummary: ${JSON.stringify(byStatus)}`);
  const failed = results.filter((r) => /error|http-|auth-/.test(r.status));
  if (failed.length) {
    fs.writeFileSync('migration-work/news-cf/cf-import-failures.json', JSON.stringify(failed, null, 2));
    console.log(`Failures written to migration-work/news-cf/cf-import-failures.json (${failed.length})`);
  }
  if (!COMMIT) {
    console.log('\nDry run complete. To create instances:');
    console.log('  1) Create the News Article CF Model in AEM CS (see migration-work/news-cf/cf-model-spec.md)');
    console.log('  2) Enable the Adobe credentials opt-in in Settings');
    console.log('  3) Re-run with:  --model <modelPath> --commit');
  }
}

main();
