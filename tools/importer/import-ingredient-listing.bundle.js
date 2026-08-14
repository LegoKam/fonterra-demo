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

  // tools/importer/import-ingredient-listing.js
  var import_ingredient_listing_exports = {};
  __export(import_ingredient_listing_exports, {
    default: () => import_ingredient_listing_default
  });

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
  function parse(element, { document }) {
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
  function parse2(element, { document }) {
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

  // tools/importer/parsers/carousel-news.js
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
    if (!url) url = bgUrl3(scope);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  var TILE_ITEM_SELECTOR = ".tileCarousel__slick--tile, .surestart-card, .tileListing__card";
  function parseTileCarousel(element, document) {
    const seen = /* @__PURE__ */ new Set();
    let tiles = Array.from(element.querySelectorAll(TILE_ITEM_SELECTOR)).filter((tile) => !tile.classList.contains("slick-cloned") && !(tile.closest && tile.closest(".slick-cloned")));
    if (tiles.length === 0 && element.matches && element.matches(".tileListing__card")) {
      tiles = [element];
    }
    tiles = tiles.filter((tile) => {
      const linkEl = tile.matches("a[href]") ? tile : tile.querySelector("a[href]");
      const href = (linkEl || {}).href || (linkEl && linkEl.getAttribute ? linkEl.getAttribute("href") : "") || "";
      const title = (tile.querySelector(".headline, h5, h4, h3, h2") || {}).textContent || "";
      const key = `${href}::${title.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      const category = tile.querySelector(".small p, .small, .categoryTitle");
      const title = tile.querySelector(".surestart-card__caption__title h4, .surestart-card__caption__title, .headline, h5, h4, h3, h2");
      const copy = tile.querySelector(".surestart-card__caption__content, .copy, .tileListing__tiles--tile-contentWrapper .copy");
      const linkEl = tile.matches("a[href]") ? tile : tile.querySelector("a[href]");
      const img = resolveImage3(tile, document, {
        imgSel: "img",
        bgSel: '.tileCarousel__slick--image, .surestart-card__figure, .tileListing__tiles--tile-imageWrapper, [class*="image"]',
        alt: title ? title.textContent.trim() : ""
      });
      let imageCell = "";
      if (img) imageCell = [document.createComment(" field:media_image "), img];
      const contentNodes = [document.createComment(" field:content_text ")];
      if (category && category.textContent.trim()) contentNodes.push(category);
      if (title && title.textContent.trim()) contentNodes.push(title);
      if (copy && copy.textContent.trim()) contentNodes.push(copy);
      if (linkEl) {
        const href = linkEl.getAttribute("href");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = title ? title.textContent.trim() : href;
          contentNodes.push(a);
        }
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
  function parse3(element, { document }) {
    const hasNewsBoxes = element.querySelector(".latestNews__box");
    const hasTiles = element.querySelector(TILE_ITEM_SELECTOR) || element.matches && element.matches(".tileListing__card");
    if (!hasNewsBoxes && hasTiles) {
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
      const img = resolveImage3(box, document, {
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
        ".emailsubscription.esBar",
        // Breadcrumb navigation. Removed by request: it imported as a `breadcrumb`
        // block, but there is no `Breadcrumb` component in the project, so md2jcr errors
        // with "The component 'Breadcrumb' does not exist." Breadcrumbs are navigation
        // chrome (regenerable from the page path), not authored content, so dropping
        // them at import is the correct fix.
        ".comp__breadcrumbs",
        ".page.breadcrumbs",
        ".breadcrumb"
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

  // tools/importer/import-ingredient-listing.js
  var PAGE_TEMPLATE = {
    name: "ingredient-listing",
    description: "Ingredient listing layout with banner, feature panels, product grids",
    urls: ["https://www.nzmp.com/global/en/ingredients/specialty/probiotics.html"],
    blocks: [
      { name: "columns-banner", instances: [".cq-dd-image.categoryBanner"] },
      { name: "columns-feature", instances: [".imageTextOverlay"] },
      { name: "carousel-news", instances: [".tileListing"] }
    ],
    sections: [
      { id: "section-1", name: "Category banner", selector: ".cq-dd-image.categoryBanner", style: null, blocks: ["columns-banner"], defaultContent: [] },
      { id: "section-2", name: "Content", selector: [".contentHolder"], style: null, blocks: ["columns-feature", "carousel-news"], defaultContent: [] }
    ]
  };
  var parsers = { "columns-banner": parse, "columns-feature": parse2, "carousel-news": parse3 };
  var transformers = [transform, ...PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []];
  function executeTransformers(hookName, element, payload) {
    const ep = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, ep);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((bd) => {
      bd.instances.forEach((sel) => {
        let els = [];
        try {
          els = document.querySelectorAll(sel);
        } catch (e) {
          return;
        }
        els.forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          pageBlocks.push({ name: bd.name, selector: sel, element: el });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_ingredient_listing_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
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
            console.error(`Failed to parse ${block.name}:`, e);
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
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_ingredient_listing_exports);
})();
