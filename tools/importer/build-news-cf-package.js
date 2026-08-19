/* eslint-disable */
/**
 * build-news-cf-package.js
 *
 * Builds a FileVault (JCR) content package for the 315 NZMP news Content Fragments,
 * so they can be uploaded to AEM via the same package route the pages use — routing
 * around the blocked author-instance Assets API.
 *
 * Output: migration-work/news-cf-package/
 *   ├── META-INF/vault/filter.xml
 *   ├── META-INF/vault/properties.xml
 *   └── jcr_root/content/dam/fonterra-demo/news/{slug}/.content.xml   (one dam:Asset per article)
 *
 * Each CF is a dam:Asset with jcr:content[contentFragment=true, cq:model=<model>]
 * and a data/master node holding the element properties (title, summary, publishDate,
 * readTime, category, tags[], heroImage, body(rich text), sourceUrl, slug).
 *
 * Usage:
 *   node tools/importer/build-news-cf-package.js \
 *     [--model /conf/fonterra-demo/settings/dam/cfm/models/news-article] \
 *     [--parent /content/dam/fonterra-demo/news]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return (v && !v.startsWith('--')) ? v : true;
}

const DATA_FILE = 'migration-work/news-cf/news-articles.json';
const MODEL = opt('model', '/conf/fonterra-demo/settings/dam/cfm/models/news-article');
const PARENT = opt('parent', '/content/dam/fonterra-demo/news').replace(/\/$/, '');
const OUT = 'migration-work/news-cf-package';
const JCR_ROOT = path.join(OUT, 'jcr_root');

// XML attribute-value escaping: < > & and " must not appear raw inside a quoted value.
function attr(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Multi-value string property: {Boolean} style not needed; commas inside values escaped as \,
function multiVal(arr) {
  const items = (arr || []).map((s) => String(s).replace(/\\/g, '\\\\').replace(/,/g, '\\,'));
  return `[${items.join(',')}]`;
}

// Typed date property for JCR: date-only → midnight UTC in ISO-8601 with offset.
function dateVal(d) {
  // d is "YYYY-MM-DD"
  return `{Date}${d}T00:00:00.000+00:00`;
}

function cfXml(rec) {
  const model = attr(MODEL);
  // Build element attributes on the master node. Omit empty optional fields.
  const el = [];
  el.push(`title="${attr(rec.title || rec.slug)}"`);
  if (rec.summary) el.push(`summary="${attr(rec.summary)}"`);
  if (rec.publishDate) el.push(`publishDate="${attr(dateVal(rec.publishDate))}"`);
  if (rec.readTime) el.push(`readTime="${attr(rec.readTime)}"`);
  if (rec.category) el.push(`category="${attr(rec.category)}"`);
  if (rec.tags && rec.tags.length) el.push(`tags="${attr(multiVal(rec.tags))}"`);
  if (rec.heroImage) el.push(`heroImage="${attr(rec.heroImage)}"`);
  if (rec.body) el.push(`body="${attr(rec.body)}"`);
  if (rec.sourceUrl) el.push(`sourceUrl="${attr(rec.sourceUrl)}"`);
  el.push(`slug="${attr(rec.slug)}"`);

  // contentType per element: body is rich text (text/html), rest are text/plain.
  // AEM stores this in data/master via the model; a :contentType/... sibling is optional.
  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:dam="http://www.day.com/dam/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:mix="http://www.jcp.org/jcr/mix/1.0"
    jcr:primaryType="dam:Asset">
  <jcr:content
      jcr:primaryType="dam:AssetContent"
      contentFragment="{Boolean}true"
      cq:model="${model}"
      jcr:title="${attr(rec.title || rec.slug)}"
      jcr:description="${attr(rec.summary || '')}">
    <data cq:model="${model}" jcr:primaryType="nt:unstructured">
      <master jcr:primaryType="nt:unstructured"
          contentType="text/html"
          ${el.join('\n          ')}/>
    </data>
    <metadata jcr:primaryType="nt:unstructured"
        dc:title="${attr(rec.title || rec.slug)}"
        dc:description="${attr(rec.summary || '')}"
        xmlns:dc="http://purl.org/dc/elements/1.1/"/>
  </jcr:content>
</jcr:root>
`;
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`Building CF package for ${records.length} articles`);
  console.log(`  model:  ${MODEL}`);
  console.log(`  parent: ${PARENT}`);

  // clean output dir
  fs.rmSync(OUT, { recursive: true, force: true });
  const parentDir = path.join(JCR_ROOT, PARENT.replace(/^\//, ''));
  fs.mkdirSync(parentDir, { recursive: true });

  let ok = 0;
  records.forEach((rec) => {
    const dir = path.join(parentDir, rec.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '.content.xml'), cfXml(rec));
    ok += 1;
  });

  // filter.xml — scope the package strictly to the news CF folder
  const metaVault = path.join(OUT, 'META-INF', 'vault');
  fs.mkdirSync(metaVault, { recursive: true });
  fs.writeFileSync(path.join(metaVault, 'filter.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
    <filter root="${PARENT}"/>
</workspaceFilter>
`);
  fs.writeFileSync(path.join(metaVault, 'properties.xml'),
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>NZMP News Content Fragments</comment>
    <entry key="name">nzmp-news-cf</entry>
    <entry key="group">fonterra-demo</entry>
    <entry key="version">1.0</entry>
</properties>
`);

  console.log(`\nWrote ${ok} CF asset nodes → ${parentDir}`);
  console.log(`Package root: ${OUT}`);
}

main();
