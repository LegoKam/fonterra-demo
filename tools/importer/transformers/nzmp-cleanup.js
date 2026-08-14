/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NZMP site-wide cleanup.
 *
 * Source is an AEM Classic (Bootstrap grid / aem-Grid / slick carousel) site.
 * Removes non-authorable page shell/chrome so the import contains only the
 * authorable page content (hero carousel, category carousel, featured
 * accordion, article carousel, email subscription form).
 *
 * ALL selectors below were verified against migration-work/cleaned.html.
 * None are guessed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Popups / overlays / hidden modals that are not inline page content and
    // could interfere with block parsing. Verified in cleaned.html:
    //   #f-gdpr-banner-id            -> GDPR cookie consent banner (L3270)
    //   .integratedContactForm       -> hidden "Contact Us" modal, id=contact-us (L2275)
    //   #globalRequestAccess         -> request-access modal (L3101)
    //   #modelRedirectModal          -> China-site redirect modal (L3151)
    //   #chinaRedirectModal          -> China-site redirect modal (L3197)
    //   #surestart-terms             -> SureStart terms modal (L3246)
    WebImporter.DOMUtils.remove(element, [
      '#f-gdpr-banner-id',
      '.integratedContactForm',
      '#globalRequestAccess',
      '#modelRedirectModal',
      '#chinaRedirectModal',
      '#surestart-terms',
      // AEM authoring placeholders and hidden trigger buttons that are not
      // authorable content but render as stray text in the import:
      //   .author-only            -> "Please Drag & Drop Background Image..." authoring hint
      //   button.surestart-terms  -> hidden "Open Modal" trigger button
      '.author-only',
      'button.surestart-terms',
      // Email subscription form. Removed by request: it imported as a base `form`
      // block, but there is no `form` component in the project, so md2jcr errors with
      // "The component 'Form' does not exist." Dropping the whole section keeps the
      // import clean until a real form component/handling is available.
      '.emailsubscription.esBar',
      // Breadcrumb navigation. Removed by request: it imported as a `breadcrumb`
      // block, but there is no `Breadcrumb` component in the project, so md2jcr errors
      // with "The component 'Breadcrumb' does not exist." Breadcrumbs are navigation
      // chrome (regenerable from the page path), not authored content, so dropping
      // them at import is the correct fix.
      '.comp__breadcrumbs',
      '.page.breadcrumbs',
      '.breadcrumb',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global shell + leftover/technical elements. Verified in cleaned.html:
    //   header             -> global navigation header, auto-populated by EDS header block (L7)
    //   footer             -> global footer <footer id="main-footer">, auto-populated by EDS footer block (L3007)
    //   .animated-cursor   -> decorative custom-cursor element (L2)
    //   iframe             -> MTCaptcha widgets in the forms (L2918, L2968)
    //   noscript / script  -> technical/IE-shim tags, not authorable content (L3095, L3097)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.animated-cursor',
      'iframe',
      'noscript',
      'script',
    ]);

    // Strip inline event handlers left over from the source site so they do not
    // leak into the imported markdown.
    element.querySelectorAll('[onclick]').forEach((el) => {
      el.removeAttribute('onclick');
    });
  }
}
