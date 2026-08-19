/* eslint-disable */
/**
 * build-news-cf-model-package.js
 *
 * Builds a FileVault (JCR) content package that CREATES the "News Article" Content
 * Fragment Model at /conf/fonterra-demo/settings/dam/cfm/models/news-article, so the
 * model can be installed via AEM Package Manager (routing around the author-instance
 * API auth block). Install THIS package first, then the CF instance package.
 *
 * A CF Model in AEM is stored as an asset-like node:
 *   /conf/<config>/settings/dam/cfm/models/<name>            [dam:Asset]
 *     jcr:content                                            [dam:AssetContent, contentFragment=true]
 *       data/policies ...                                    (omitted; defaults apply)
 *       model  (cq:PageContent-ish) → holds the form items (fields)
 *
 * The authoritative, import-friendly representation AEM uses is the model's
 * "jcr:content/model/cq:dialog"-style field list. We emit the widely-compatible
 * form: jcr:content[contentFragment=true] + a `model` node whose child `items`
 * describe each element with resourceType + valueType, matching what the CF Model
 * editor produces.
 *
 * Usage:
 *   node tools/importer/build-news-cf-model-package.js
 *     [--path /conf/fonterra-demo/settings/dam/cfm/models/news-article]
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

const MODEL_PATH = opt('path', '/conf/fonterra-demo/settings/dam/cfm/models/news-article');
const OUT = 'migration-work/news-cf-model-package';
const JCR_ROOT = path.join(OUT, 'jcr_root');

function attr(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Field definitions — property names MUST match the instance package's master node.
// resourceType/valueType follow the CF Model editor's data-type components.
const RT = 'dam/cfm/models/editor/components/datatypes';
const FIELDS = [
  { name: 'title',       label: 'Title',        type: 'text',           valueType: 'string',  required: true },
  { name: 'summary',     label: 'Summary',      type: 'multitext',      valueType: 'string' },
  { name: 'publishDate', label: 'Publish Date', type: 'datetime',       valueType: 'calendar', typeHint: 'date' },
  { name: 'readTime',    label: 'Read Time',    type: 'text',           valueType: 'string' },
  { name: 'category',    label: 'Category',     type: 'enumeration',    valueType: 'string',
    options: ['Blog', 'Awards', 'Events', 'News', 'Insights'] },
  { name: 'tags',        label: 'Tags',         type: 'text',           valueType: 'string',  multiple: true },
  { name: 'heroImage',   label: 'Hero Image',   type: 'text',           valueType: 'string' },
  { name: 'body',        label: 'Body',         type: 'multitext',      valueType: 'string',  richText: true },
  { name: 'sourceUrl',   label: 'Source URL',   type: 'text',           valueType: 'string' },
  { name: 'slug',        label: 'Slug',         type: 'text',           valueType: 'string',  required: true },
];

function fieldXml(f, idx) {
  const a = [];
  a.push(`jcr:primaryType="nt:unstructured"`);
  a.push(`sling:resourceType="${RT}/${attr(f.type)}"`);
  a.push(`fieldLabel="${attr(f.label)}"`);
  a.push(`name="${attr(f.name)}"`);
  a.push(`valueType="${attr(f.valueType)}"`);
  if (f.required) a.push(`required="{Boolean}true"`);
  if (f.multiple) a.push(`multiple="{Boolean}true"`);
  if (f.richText) a.push(`multiline="{Boolean}true"`, `default:contentType="text/html"`);
  if (f.typeHint === 'date') a.push(`typeHint="date"`);
  let inner = '';
  if (f.options) {
    const opts = f.options.map((o, i) =>
      `        <item_${i} jcr:primaryType="nt:unstructured" text="${attr(o)}" value="${attr(o)}"/>`).join('\n');
    inner = `\n      <options jcr:primaryType="nt:unstructured">\n${opts}\n      </options>\n    `;
  }
  return `    <item_${idx} ${a.join('\n        ')}>${inner}</item_${idx}>`;
}

function modelXml() {
  const items = FIELDS.map((f, i) => fieldXml(f, i)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:dam="http://www.day.com/dam/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="dam:Asset">
  <jcr:content
      jcr:primaryType="dam:AssetContent"
      contentFragment="{Boolean}true"
      jcr:title="News Article"
      jcr:description="NZMP news article content fragment model">
    <data jcr:primaryType="nt:unstructured">
      <cq:model jcr:primaryType="nt:unstructured"
          jcr:title="News Article"
          modelType="dam/cfm/models/model"
          status="enabled">
        <items jcr:primaryType="nt:unstructured">
${items}
        </items>
      </cq:model>
    </data>
    <metadata jcr:primaryType="nt:unstructured" xmlns:dc="http://purl.org/dc/elements/1.1/"
        dc:title="News Article"/>
  </jcr:content>
</jcr:root>
`;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const modelDir = path.join(JCR_ROOT, MODEL_PATH.replace(/^\//, ''));
  fs.mkdirSync(modelDir, { recursive: true });
  fs.writeFileSync(path.join(modelDir, '.content.xml'), modelXml());

  const metaVault = path.join(OUT, 'META-INF', 'vault');
  fs.mkdirSync(metaVault, { recursive: true });
  fs.writeFileSync(path.join(metaVault, 'filter.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
    <filter root="${MODEL_PATH}"/>
</workspaceFilter>
`);
  fs.writeFileSync(path.join(metaVault, 'properties.xml'),
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>NZMP News Article CF Model</comment>
    <entry key="name">nzmp-news-cf-model</entry>
    <entry key="group">fonterra-demo</entry>
    <entry key="version">1.0</entry>
</properties>
`);
  console.log(`Wrote CF Model package → ${OUT}`);
  console.log(`  model path: ${MODEL_PATH}`);
  console.log(`  fields: ${FIELDS.map((f) => f.name).join(', ')}`);
}

main();
