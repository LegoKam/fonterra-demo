# NZMP News — Content Fragment package

`nzmp-news-cf.zip` is an AEM FileVault content package containing all 315 NZMP news
articles as Content Fragments (`dam:Asset` nodes).

## Install
AEM → **Tools → Deployment → Package Manager → Upload Package** → select
`nzmp-news-cf.zip` → **Install**.

Creates 315 CFs under `/content/dam/fonterra-demo/news/{slug}`, each bound to the model
`/conf/fonterra-demo/settings/dam/cfm/models/news-article`.

**Prerequisite:** the `News Article` CF model must exist at that path first
(fields per `migration-work/news-cf/cf-model-spec.md`).

## Rebuild
If the model's field names differ, edit `../build-news-cf-package.js` (`cfXml()`), then:
```
node tools/importer/build-news-cf-package.js
```
and re-zip from `migration-work/news-cf-package/` (or copy the regenerated zip here).

## Verify after install
Browse `/content/dam/fonterra-demo/news` in AEM Assets, or
`GET {author}/api/assets/content/dam/fonterra-demo/news.json` — expect 315 entries.
