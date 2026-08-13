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

  // tools/importer/import-home-page.js
  var import_home_page_exports = {};
  __export(import_home_page_exports, {
    default: () => import_home_page_default
  });

  // tools/importer/parsers/carousel-banner.js
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
    if (!url) url = bgUrl(scope);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".homeBanner__item")).filter((slide) => !slide.classList.contains("slick-cloned"));
    const cells = [];
    slides.forEach((slide) => {
      const title = slide.querySelector(".homeBanner__title, .title h1, h1, h2");
      const desc = slide.querySelector(".homeBanner__desc, .copy p");
      const cta = slide.querySelector("a.nzmpBtn, .homeBanner__content a, a.button-link, a");
      const img = resolveImage(slide, document, {
        imgSel: ".homeBanner__image--desktop img, .homeBanner__image img, img",
        bgSel: ".homeBanner__image--desktop, .homeBanner__image",
        alt: title ? title.textContent.trim() : ""
      });
      let imageCell = "";
      if (img) {
        imageCell = [document.createComment(" field:media_image "), img];
      }
      const contentNodes = [document.createComment(" field:content_text ")];
      if (title) contentNodes.push(title);
      if (desc && desc.textContent.trim()) contentNodes.push(desc);
      if (cta) contentNodes.push(cta);
      if (img || title || cta) {
        cells.push([imageCell, contentNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-category.js
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
    if (!url) url = bgUrl2(scope);
    if (url) {
      const newImg = document.createElement("img");
      newImg.setAttribute("src", url);
      if (alt) newImg.setAttribute("alt", alt);
      return newImg;
    }
    return null;
  }
  function parse2(element, { document }) {
    const seen = /* @__PURE__ */ new Set();
    const cards = Array.from(element.querySelectorAll(".horizontalCategoryCarousel__card")).filter((card) => !card.classList.contains("slick-cloned")).filter((card) => {
      const href = (card.querySelector("a[href]") || {}).href || "";
      const title = (card.querySelector(".horizontalCategoryCarousel__card-title, h2, h3") || {}).textContent || "";
      const key = `${href}::${title.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const cells = [];
    cards.forEach((card) => {
      const title = card.querySelector(".horizontalCategoryCarousel__card-title, h2, h3");
      const desc = card.querySelector(".horizontalCategoryCarousel__copy p, .horizontalCategoryCarousel__copy");
      const cta = card.querySelector("a.nzmpBtn, .horizontalCategoryCarousel__content__fade a, a.button-link, a");
      const img = resolveImage2(card, document, {
        imgSel: ".horizontalCategoryCarousel__card__wrapper > img, img",
        bgSel: ".horizontalCategoryCarousel__card__wrapper, .horizontalCategoryCarousel__card__image",
        alt: title ? title.textContent.trim() : ""
      });
      let imageCell = "";
      if (img) {
        imageCell = [document.createComment(" field:media_image "), img];
      }
      const contentNodes = [document.createComment(" field:content_text ")];
      if (title) contentNodes.push(title);
      if (desc && desc.textContent.trim()) contentNodes.push(desc);
      if (cta) contentNodes.push(cta);
      if (img || title) {
        cells.push([imageCell, contentNodes]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-featured.js
  function parse3(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(".cmp-featured-tile__panel--body-tile"));
    const introHeading = element.querySelector(".headline, h1, h2, h3, h4");
    let headingEl = null;
    if (introHeading && introHeading.textContent.trim()) {
      const level = /^H[1-6]$/.test(introHeading.tagName) ? introHeading.tagName : "H3";
      headingEl = document.createElement(level.toLowerCase());
      headingEl.textContent = introHeading.textContent.trim();
    }
    const cells = [];
    tiles.forEach((tile) => {
      const labelBtn = tile.querySelector(".cmp-featured-tile__panel--body-btn, h2 button, button");
      const summaryText = labelBtn ? labelBtn.textContent.trim() : "";
      const desc = tile.querySelector(".copy p, .copy, .cmp-featured-tile__panel--body__wrapper p");
      const cta = tile.querySelector(".button-link a, a.nzmpNewArrowLink, a");
      if (!summaryText && !desc && !cta) return;
      const summaryCell = [
        document.createComment(" field:summary "),
        document.createTextNode(summaryText)
      ];
      const textCell = [document.createComment(" field:text ")];
      if (desc && desc.textContent.trim()) textCell.push(desc);
      if (cta) {
        cta.querySelectorAll("em, i, svg").forEach((icon) => icon.remove());
        textCell.push(cta);
      }
      cells.push([summaryCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-featured", cells });
    if (headingEl) {
      element.replaceWith(headingEl, block);
    } else {
      element.replaceWith(block);
    }
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
  function parse4(element, { document }) {
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

  // tools/importer/import-home-page.js
  var PAGE_TEMPLATE = {
    name: "home-page",
    description: "NZMP global homepage with hero banner carousel, category carousel, featured tiles/vertical carousel, and article teaser carousel",
    urls: [
      "https://www.nzmp.com/global/en.html"
    ],
    blocks: [
      {
        name: "carousel-banner",
        instances: [".homeBanner__container"]
      },
      {
        name: "carousel-category",
        instances: [".horizontalCategoryCarousel__container", ".horizontalCategoryCarousel.duskBlue"]
      },
      {
        name: "accordion-featured",
        instances: [".verticalCarousel", ".cmp-featured-tile"]
      },
      {
        name: "carousel-news",
        instances: [".slickCarouselArticles__slick", ".pageTeaser__wrapper.slickCarouselArticles"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero banner carousel",
        selector: ".homeBanner__container",
        style: null,
        blocks: ["carousel-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Applications category carousel",
        selector: [".horizontalCategoryCarousel.duskBlue", ".pageTeaser.list.parbase"],
        style: "dark-blue",
        blocks: ["carousel-category"],
        defaultContent: [".horizontalCategoryCarousel__title"]
      },
      {
        id: "section-3",
        name: "We can help you featured list",
        selector: ".verticalCarousel",
        style: null,
        blocks: ["accordion-featured"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Read the latest from NZMP",
        selector: ".responsivegrid-centered",
        style: null,
        blocks: ["carousel-news"],
        defaultContent: [".title-arrows", ".ctabutton"]
      }
    ]
  };
  var parsers = {
    "carousel-banner": parse,
    "carousel-category": parse2,
    "accordion-featured": parse3,
    "carousel-news": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_home_page_default = {
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
  return __toCommonJS(import_home_page_exports);
})();
