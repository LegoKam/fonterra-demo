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

  // tools/importer/import-ingredient-product-detail.js
  var import_ingredient_product_detail_exports = {};
  __export(import_ingredient_product_detail_exports, {
    default: () => import_ingredient_product_detail_default
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

  // tools/importer/parsers/columns-product.js
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
    const cols = Array.from(element.querySelectorAll(":scope .productDetailBanner__col"));
    const headline = element.querySelector(".main-headline h1, .main-headline h2, .headline h1, h1");
    const description = element.querySelector(".copy, .copyWrapper");
    const features = element.querySelector(".productDetailBanner__col--feature");
    const tags = element.querySelector(".productDetailBanner__tags");
    const cta = element.querySelector(".buttonLink a, a.nzmpBtn");
    const contentCell = [];
    if (headline) contentCell.push(headline);
    if (description) contentCell.push(description);
    if (features) contentCell.push(features);
    if (tags) contentCell.push(tags);
    if (cta) contentCell.push(cta);
    const imageScope = cols.length ? cols[cols.length - 1] : element;
    const img = resolveImage(imageScope, document, {
      imgSel: ".carousel-inner img, .item img, img",
      bgSel: ".carousel-item, .item",
      alt: headline ? headline.textContent.trim() : ""
    });
    const imageCell = [];
    if (img) imageCell.push(img);
    const disclaimers = Array.from(element.querySelectorAll(".disclaimerText"));
    const seenDisc = /* @__PURE__ */ new Set();
    disclaimers.forEach((d) => {
      const t = (d.textContent || "").trim();
      if (t && !seenDisc.has(t)) {
        seenDisc.add(t);
        imageCell.push(d);
      }
    });
    if (!contentCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
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

  // tools/importer/parsers/cards-benefit.js
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
    const parent = element.parentElement || element;
    let cards = Array.from(parent.querySelectorAll(":scope > .textIconCard"));
    if (!cards.length) cards = [element];
    if (!cards.includes(element)) cards.unshift(element);
    const cells = [];
    cards.forEach((card) => {
      const title = card.querySelector(".cmp-text-icon-card__headline .title, .cmp-text-icon-card__headline h3, .title h3, h3");
      const img = resolveImage3(card, document, {
        imgSel: ".cmp-image img, .image img, img",
        bgSel: ".cmp-image, .image",
        alt: title ? title.textContent.trim() : ""
      });
      const description = card.querySelector(".cmp-text-icon-card__description, .richtext");
      let imageCell = "";
      if (img) {
        imageCell = [document.createComment(" field:image "), img];
      }
      const textNodes = [document.createComment(" field:text ")];
      if (title) textNodes.push(title);
      if (description && description.textContent.trim()) textNodes.push(description);
      if (img || title || description) {
        cells.push([imageCell, textNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-benefit", cells });
    cards.forEach((card) => {
      if (card !== element && card.parentNode) card.remove();
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-news.js
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
    if (!url) url = bgUrl4(scope);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parseTileCarousel(element, document) {
    const seen = /* @__PURE__ */ new Set();
    const tiles = Array.from(element.querySelectorAll(".tileCarousel__slick--tile")).filter((tile) => !tile.classList.contains("slick-cloned")).filter((tile) => {
      const href = (tile.querySelector("a[href]") || {}).href || "";
      const title = (tile.querySelector(".headline, h5, h4, h3") || {}).textContent || "";
      const key = `${href}::${title.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      const category = tile.querySelector(".small p, .small, .categoryTitle");
      const title = tile.querySelector(".headline, h5, h4, h3");
      const link = tile.querySelector("a[href]");
      const img = resolveImage4(tile, document, {
        imgSel: "img",
        bgSel: '.tileCarousel__slick--image, [class*="image"]',
        alt: title ? title.textContent.trim() : ""
      });
      let imageCell = "";
      if (img) imageCell = [document.createComment(" field:media_image "), img];
      const contentNodes = [document.createComment(" field:content_text ")];
      if (category && category.textContent.trim()) contentNodes.push(category);
      if (title && title.textContent.trim()) contentNodes.push(title);
      if (link) {
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = title ? title.textContent.trim() : link.getAttribute("href");
        contentNodes.push(a);
      }
      if (img || title) cells.push([imageCell, contentNodes]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
  }
  function parse5(element, { document }) {
    const hasNewsBoxes = element.querySelector(".latestNews__box");
    if (!hasNewsBoxes && element.querySelector(".tileCarousel__slick--tile")) {
      parseTileCarousel(element, document);
      return;
    }
    const seen = /* @__PURE__ */ new Set();
    const boxes = Array.from(element.querySelectorAll(".latestNews__box")).filter((box) => !box.classList.contains("slick-cloned")).filter((box) => {
      const href = (box.querySelector("a[href]") || {}).href || "";
      const headline = (box.querySelector(".headline h5, .headline, h5") || {}).textContent || "";
      const key = `${href}::${headline.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const cells = [];
    boxes.forEach((box) => {
      const category = box.querySelector(".categoryTitle p, .categoryTitle");
      const headline = box.querySelector(".headline h5, .headline, h5");
      const date = box.querySelector(".date span, .date");
      const link = box.querySelector("a[href]");
      const img = resolveImage4(box, document, {
        imgSel: ".latestNews__box-image img, img",
        bgSel: ".latestNews__box-image",
        alt: headline ? headline.textContent.trim() : ""
      });
      let imageCell = "";
      if (img) {
        imageCell = [document.createComment(" field:media_image "), img];
      }
      const contentNodes = [document.createComment(" field:content_text ")];
      if (category && category.textContent.trim()) contentNodes.push(category);
      if (headline && headline.textContent.trim()) contentNodes.push(headline);
      if (date && date.textContent.trim()) contentNodes.push(date);
      if (link) {
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = headline ? headline.textContent.trim() : link.getAttribute("href");
        contentNodes.push(a);
      }
      if (img || headline) {
        cells.push([imageCell, contentNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
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

  // tools/importer/import-ingredient-product-detail.js
  var PAGE_TEMPLATE = {
    name: "ingredient-product-detail",
    description: "Deep product-detail layout for a single ingredient",
    urls: [
      "https://www.nzmp.com/global/en/ingredients/cheese/cheddar-cheese/cheddar-cheese-au.html"
    ],
    blocks: [
      { name: "breadcrumb", instances: [".comp__breadcrumbs"] },
      { name: "columns-product", instances: [".productDetailBanner"] },
      { name: "columns-feature", instances: [".imageTextOverlay"] },
      { name: "cards-benefit", instances: [".textIconCard"] },
      { name: "carousel-news", instances: [".pageTeaser__wrapper.tileCarousel"] }
      // NOTE: the `form` block (.integratedContactForm) and the newsletter
      // (.emailsubscription.esBar) are intentionally NOT parsed here — they are
      // removed by nzmp-cleanup (beforeTransform) because there is no `form`
      // component in the project (md2jcr would error "The component 'Form' does
      // not exist"), matching the home-page treatment.
    ],
    sections: [
      { id: "section-1", name: "Breadcrumb", selector: ".comp__breadcrumbs", style: null, blocks: ["breadcrumb"], defaultContent: [] },
      { id: "section-2", name: "Product hero", selector: ".productDetailBanner", style: null, blocks: ["columns-product"], defaultContent: [] },
      { id: "section-3", name: "Product content grid", selector: [".page-content-product > div.row"], style: null, blocks: ["columns-feature", "cards-benefit", "carousel-news"], defaultContent: [] }
    ]
  };
  var parsers = {
    breadcrumb: parse,
    "columns-product": parse2,
    "columns-feature": parse3,
    "cards-benefit": parse4,
    "carousel-news": parse5
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
      let matched = false;
      blockDef.instances.forEach((selector) => {
        if (matched) return;
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;
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
        matched = true;
      });
      if (!matched) {
        console.warn(`Block "${blockDef.name}" not found with any selector: ${blockDef.instances.join(", ")}`);
      }
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_ingredient_product_detail_default = {
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
        } else {
          console.warn(`No parser found for block: ${block.name}`);
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
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_ingredient_product_detail_exports);
})();
