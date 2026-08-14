/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-category-landing.js
  var import_category_landing_exports = {};
  __export(import_category_landing_exports, {
    default: () => import_category_landing_default
  });

  // tools/importer/parsers/breadcrumb.js
  function parse(element, { document }) {
    const items = Array.from(element.querySelectorAll("ol.breadcrumb > li, .breadcrumb > li"));
    const list = document.createElement("ul");
    items.forEach((li) => {
      const anchor = li.querySelector("a[href]");
      const outLi = document.createElement("li");
      if (anchor) {
        const label = anchor.textContent.trim() || anchor.getAttribute("title") || "";
        const a = document.createElement("a");
        a.setAttribute("href", anchor.getAttribute("href"));
        a.textContent = label;
        outLi.appendChild(a);
      } else {
        const label = (li.textContent || "").trim();
        outLi.textContent = label;
      }
      if (outLi.textContent.trim()) list.appendChild(outLi);
    });
    if (!list.childNodes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[[list]]];
    const block = WebImporter.Blocks.createBlock(document, { name: "breadcrumb", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-banner.js
  function bgUrl(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
    return m ? m[2].trim() : "";
  }
  function resolveImage(scope, document, { imgSel, bgSel, alt }) {
    const img = imgSel ? scope.querySelector(imgSel) : null;
    if (img) {
      const real = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
      if (real && (!img.getAttribute("src") || img.getAttribute("src").trim() === "")) {
        img.setAttribute("src", real);
      }
      if (img.getAttribute("src") && img.getAttribute("src").trim()) {
        if (alt && !img.getAttribute("alt")) img.setAttribute("alt", alt);
        return img;
      }
    }
    let url = "";
    const bgEls = bgSel ? Array.from(scope.querySelectorAll(bgSel)) : [];
    for (let i = 0; i < bgEls.length && !url; i += 1) url = bgUrl(bgEls[i]);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse2(element, { document }) {
    const heading = element.querySelector(".categoryBanner__row--left .headline h1, .categoryBanner__row--left h1, .headline h1, h1, h2");
    const copy = element.querySelector(".categoryBanner__row--left .copy p, .categoryBanner__row--left .copy, .copy p");
    const img = resolveImage(element, document, {
      imgSel: ".categoryBanner__row--right img, .categoryBanner__row--right-image img, img",
      bgSel: ".categoryBanner__row--right-image, .categoryBanner__row--right",
      alt: heading ? heading.textContent.trim() : ""
    });
    if (!heading && !copy && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const leftCell = [];
    if (heading) leftCell.push(heading);
    if (copy && copy.textContent.trim()) leftCell.push(copy);
    const rightCell = [];
    if (img) rightCell.push(img);
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function bgUrl2(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
    return m ? m[2].trim() : "";
  }
  function resolveImage2(scope, document, { imgSel, bgSel, alt }) {
    const img = imgSel ? scope.querySelector(imgSel) : null;
    if (img) {
      const real = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
      if (real && (!img.getAttribute("src") || img.getAttribute("src").trim() === "")) {
        img.setAttribute("src", real);
      }
      if (img.getAttribute("src") && img.getAttribute("src").trim()) {
        if (alt && !img.getAttribute("alt")) img.setAttribute("alt", alt);
        return img;
      }
    }
    let url = "";
    const bgEls = bgSel ? Array.from(scope.querySelectorAll(bgSel)) : [];
    for (let i = 0; i < bgEls.length && !url; i += 1) url = bgUrl2(bgEls[i]);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse3(element, { document }) {
    const title = element.querySelector(".image-badge__v2-contents .title, .pageIntro__row--right .title, h4, h3, h2");
    const copy = element.querySelector(".image-badge__v2-contents .copy, .pageIntro__row--right .copy");
    const img = resolveImage2(element, document, {
      imgSel: ".image-badge__v2-image img, .pageIntro__row--left img, img",
      bgSel: ".image-badge__v2-image, .pageIntro__row--left",
      alt: title ? title.textContent.trim() : ""
    });
    const imageCell = [];
    if (img) imageCell.push(img);
    const contentCell = [];
    if (title) contentCell.push(title);
    if (copy) contentCell.push(copy);
    if (!imageCell.length && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell, contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function bgUrl3(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
    return m ? m[2].trim() : "";
  }
  function resolveImage3(scope, document, { imgSel, bgSel, alt }) {
    const img = imgSel ? scope.querySelector(imgSel) : null;
    if (img) {
      const real = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
      if (real && (!img.getAttribute("src") || img.getAttribute("src").trim() === "")) {
        img.setAttribute("src", real);
      }
      if (img.getAttribute("src") && img.getAttribute("src").trim()) {
        if (alt && !img.getAttribute("alt")) img.setAttribute("alt", alt);
        return img;
      }
    }
    let url = "";
    const bgEls = bgSel ? Array.from(scope.querySelectorAll(bgSel)) : [];
    for (let i = 0; i < bgEls.length && !url; i += 1) url = bgUrl3(bgEls[i]);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse4(element, { document }) {
    const headline = element.querySelector(".cmp-multicolumn-grid__headline");
    if (!headline) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cols = Array.from(element.querySelectorAll(".multi-col")).filter((col) => col.textContent.trim() || col.querySelector("img"));
    const cells = [];
    cols.forEach((col) => {
      const title = col.querySelector("h3, h2, h4, .title");
      const img = resolveImage3(col, document, {
        imgSel: ".responsiveimage img, .image img, img",
        bgSel: ".responsiveimage, .image",
        alt: title ? title.textContent.trim() : ""
      });
      const descriptions = Array.from(col.querySelectorAll(".richtext")).filter((d) => d.textContent.trim() && !d.contains(title));
      const cta = col.querySelector(".ctabutton a, .cta-btn a, a.nzmpBtn, a");
      let imageCell = "";
      if (img) imageCell = [document.createComment(" field:image "), img];
      const textNodes = [document.createComment(" field:text ")];
      if (title) textNodes.push(title);
      descriptions.forEach((d) => textNodes.push(d));
      if (cta) textNodes.push(cta);
      if (img || title || descriptions.length || cta) {
        cells.push([imageCell, textNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    const frag = document.createDocumentFragment();
    const headingEls = Array.from(headline.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if (headingEls.length) {
      headingEls.forEach((h) => frag.appendChild(h));
    } else if (headline.textContent.trim()) {
      frag.appendChild(headline);
    }
    frag.appendChild(block);
    element.replaceWith(frag);
  }

  // tools/importer/parsers/cards-value.js
  function parse5(element, { document }) {
    if (element.querySelector(".cmp-multicolumn-grid__headline")) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cols = Array.from(element.querySelectorAll(".multi-col")).filter((col) => col.textContent.trim());
    const cells = [];
    cols.forEach((col) => {
      const title = col.querySelector("h3, h2, h4, .title");
      const richBlocks = Array.from(col.querySelectorAll(".richtext"));
      const descriptions = richBlocks.filter((d) => d.textContent.trim() && !d.contains(title));
      const imageCell = "";
      const textNodes = [document.createComment(" field:text ")];
      if (title) textNodes.push(title);
      descriptions.forEach((d) => textNodes.push(d));
      if (title || descriptions.length) {
        cells.push([imageCell, textNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-value", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function bgUrl4(el) {
    if (!el) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
    return m ? m[2].trim() : "";
  }
  function resolveImage4(scope, document, { imgSel, bgSel, alt }) {
    const img = imgSel ? scope.querySelector(imgSel) : null;
    if (img) {
      const real = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
      if (real && (!img.getAttribute("src") || img.getAttribute("src").trim() === "")) {
        img.setAttribute("src", real);
      }
      if (img.getAttribute("src") && img.getAttribute("src").trim()) {
        if (alt && !img.getAttribute("alt")) img.setAttribute("alt", alt);
        return img;
      }
    }
    let url = "";
    const bgEls = bgSel ? Array.from(scope.querySelectorAll(bgSel)) : [];
    for (let i = 0; i < bgEls.length && !url; i += 1) url = bgUrl4(bgEls[i]);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse6(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(".twoColStack__row--tile")).filter((tile) => tile.textContent.trim() || tile.querySelector("img"));
    const cells = [];
    tiles.forEach((tile) => {
      const anchor = tile.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const title = tile.querySelector(".twoColStack__row--tile-contents .headline h3, .headline h3, h3, h2, .title");
      const img = resolveImage4(tile, document, {
        imgSel: ".twoColStack__row--tile-image img, img",
        bgSel: ".twoColStack__row--tile-image",
        alt: title ? title.textContent.trim() : ""
      });
      const copy = tile.querySelector(".copy p, .copy, p");
      const labelEl = tile.querySelector(".textLink .link_itemLabel, .textLink, .link_itemLabel");
      let link = null;
      if (href) {
        link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = labelEl && labelEl.textContent.trim() ? labelEl.textContent.trim() : "Learn more";
      }
      let imageCell = "";
      if (img) imageCell = [document.createComment(" field:image "), img];
      const textNodes = [document.createComment(" field:text ")];
      if (title) textNodes.push(title);
      if (copy && copy.textContent.trim()) textNodes.push(copy);
      if (link) textNodes.push(link);
      if (img || title || copy && copy.textContent.trim() || link) {
        cells.push([imageCell, textNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells });
    const frag = document.createDocumentFragment();
    const sectionTitle = element.querySelector(".headline.section_title, .section_title");
    if (sectionTitle) {
      const headingEls = Array.from(sectionTitle.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      if (headingEls.length) headingEls.forEach((h) => frag.appendChild(h));
      else if (sectionTitle.textContent.trim()) frag.appendChild(sectionTitle);
    }
    frag.appendChild(block);
    element.replaceWith(frag);
  }

  // tools/importer/transformers/nzmp-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#f-gdpr-banner-id",
        ".integratedContactForm",
        "#globalRequestAccess",
        "#modelRedirectModal",
        "#chinaRedirectModal",
        "#surestart-terms",
        // AEM authoring placeholders and hidden trigger buttons that are not
        // authorable content but render as stray text in the import:
        //   .author-only            -> "Please Drag & Drop Background Image..." authoring hint
        //   button.surestart-terms  -> hidden "Open Modal" trigger button
        ".author-only",
        "button.surestart-terms",
        // Email subscription form. Removed by request: it imported as a base `form`
        // block, but there is no `form` component in the project, so md2jcr errors with
        // "The component 'Form' does not exist." Dropping the whole section keeps the
        // import clean until a real form component/handling is available.
        ".emailsubscription.esBar"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".animated-cursor",
        "iframe",
        "noscript",
        "script"
      ]);
      element.querySelectorAll("[onclick]").forEach((el) => {
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/nzmp-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function resolveSectionElement(element, selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const found = element.querySelector(sel);
      if (found) return found;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const template = payload && payload.template;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (sections.length < 2) return;
      const { document } = payload;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section) continue;
        const anchor = resolveSectionElement(element, section.selector);
        if (!anchor || !anchor.parentNode) continue;
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          anchor.parentNode.insertBefore(metadataBlock, anchor.nextSibling);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          anchor.parentNode.insertBefore(hr, anchor);
        }
      }
    }
  }

  // tools/importer/import-category-landing.js
  var PAGE_TEMPLATE = {
    name: "category-landing",
    description: "Mid-level category/landing layout with intro banner and a grid of child cards",
    urls: ["https://www.nzmp.com/global/en/about-nzmp/global-ingredients.html"],
    blocks: [
      { name: "breadcrumb", instances: [".comp__breadcrumbs"] },
      { name: "columns-banner", instances: [".cq-dd-image.categoryBanner"] },
      { name: "columns-feature", instances: [".imageTextOverlay"] },
      // cards-category and cards-value both originate from .multicolumn-grid, distinguished
      // ONLY by presence of a .cmp-multicolumn-grid__headline. jsdom (importer DOM) supports
      // :has()/:not(:has()), so these selectors correctly split the two. Each parser is also
      // defensive (bails on the wrong headline-presence type) as a safety net.
      { name: "cards-category", instances: [".multicolumn-grid:has(.cmp-multicolumn-grid__headline)"] },
      { name: "cards-value", instances: [".multicolumn-grid:not(:has(.cmp-multicolumn-grid__headline))"] },
      { name: "cards-teaser", instances: [".pageTeaser__wrapper.twoColStack"] }
      // form + newsletter removed by nzmp-cleanup (no form component).
    ],
    sections: [
      { id: "section-1", name: "Breadcrumb", selector: ".comp__breadcrumbs", style: null, blocks: ["breadcrumb"], defaultContent: [] },
      { id: "section-2", name: "Category intro banner", selector: ".cq-dd-image.categoryBanner", style: null, blocks: ["columns-banner"], defaultContent: [] },
      { id: "section-3", name: "Content holder", selector: [".contentHolder"], style: null, blocks: ["columns-feature", "cards-value", "cards-category", "cards-teaser"], defaultContent: [] }
    ]
  };
  var parsers = {
    breadcrumb: parse,
    "columns-banner": parse2,
    "columns-feature": parse3,
    "cards-category": parse4,
    "cards-value": parse5,
    "cards-teaser": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Selector not supported, skipping: ${selector}`);
          return;
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_category_landing_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_category_landing_exports);
})();
