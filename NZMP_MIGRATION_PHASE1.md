# NZMP Migration to AEM Edge Delivery Services
## Phase 1: Foundation & Home Page

**Status:** 🚀 IN PROGRESS  
**Start Date:** 2026-08-13  
**Target Completion:** 2026-08-20  
**Content Base Path:** `/content/fonterra-demo`  
**Assets Base Path:** `/content/dam/fonterra-demo`  

---

## ✅ Completed Tasks

### 1. Infrastructure Setup
- [x] AEM JWT Authentication configured
- [x] Feature branch created: `feat/nzmp-home-migration`
- [x] AEM content folder structure planned
- [x] DAM asset folder structure designed

### 2. Block Development
- [x] **applications-grid** block
  - JS: `blocks/applications-grid/applications-grid.js`
  - CSS: `blocks/applications-grid/applications-grid.css`
  - Model: `blocks/applications-grid/_applications-grid.json`
  
- [x] **news-feed** block
  - JS: `blocks/news-feed/news-feed.js`
  - CSS: `blocks/news-feed/news-feed.css`
  - Model: `blocks/news-feed/_news-feed.json`

### 3. Build System
- [x] Component definitions aggregated
- [x] New blocks registered in `component-definition.json`
- [x] New blocks registered in `component-models.json`
- [x] New blocks registered in `component-filters.json`

### 4. Documentation
- [x] Home page content template created: `drafts/home.md`
- [x] Migration plan document created
- [x] Phase 1 checklist created (this document)

---

## 📋 Remaining Tasks - Phase 1

### Task 1: Create AEM Content Structure (In Progress)
**Timeline:** Next Step  
**Responsible:** Claude AI + AEM API

```bash
# To execute when ready:
node scripts/aem-setup.js
```

**What this does:**
- Creates `/content/fonterra-demo/en/home` folder
- Creates `/content/fonterra-demo/en/about` folder
- Creates `/content/fonterra-demo/en/solutions` folder
- Creates `/content/fonterra-demo/en/ingredients` folder structure
- Creates `/content/fonterra-demo/en/applications` folder
- Creates `/content/fonterra-demo/en/sustainability` folder
- Creates `/content/fonterra-demo/en/buy` folder
- Creates `/content/fonterra-demo/en/news` folder
- Creates `/content/dam/fonterra-demo` asset folders

### Task 2: Test Blocks Locally
**Timeline:** After AEM setup  
**Command:**
```bash
npm install -g @adobe/aem-cli
aem up
# Opens http://localhost:3000
```

**What to test:**
1. Navigate to `http://localhost:3000/drafts/home.md`
2. Verify hero block renders correctly
3. Verify applications-grid block displays 6 cards
4. Verify news-feed block displays article cards
5. Test responsive design (mobile, tablet, desktop)
6. Check CSS styling and spacing

### Task 3: Optimize Home Page Assets
**Timeline:** While blocks are being tested  
**Assets needed:**

```
/content/dam/fonterra-demo/images/homepage/
├── hero-expertise.jpg
├── hero-quality.jpg
├── hero-sustainability.jpg
└── hero-support.jpg

/content/dam/fonterra-demo/images/applications/
├── yogurts.jpg
├── milk-powder.jpg
├── food-manufacturing.jpg
├── formulated-products.jpg
├── foodservice.jpg
└── regional-distribution.jpg

/content/dam/fonterra-demo/images/news/
├── news-1.jpg
├── news-2.jpg
├── news-3.jpg
├── news-4.jpg
├── news-5.jpg
└── news-6.jpg

/content/dam/fonterra-demo/logos/
├── nzmp-logo.svg
├── fonterra-logo.svg
└── nzmp-logo-white.svg
```

**Asset requirements:**
- All images must be optimized (max 200KB each)
- Use WebP format where possible with JPEG fallback
- Maintain aspect ratios:
  - Hero images: 16:9
  - Application cards: 4:3
  - News article images: 16:9
- Minimum resolution: 1200px width
- Maximum resolution: 2400px width

### Task 4: Create Home Page in AEM
**Timeline:** After assets are uploaded  
**Location:** `/content/fonterra-demo/en/home`

**Process:**
1. Log in to AEM Universal Editor
2. Navigate to `/content/fonterra-demo/en/home`
3. Create new page from template
4. Add Hero blocks (4 sequential sections)
5. Add Applications Grid section
6. Add Feature/Info sections
7. Add News Feed section
8. Configure links and CTAs
9. Publish to preview environment

**Content to include:**
- See `drafts/home.md` for complete content structure

### Task 5: Branding & Styling
**Timeline:** Parallel to content creation  
**Files to update:**

1. **Global CSS (`styles/styles.css`)**
   - Color scheme from NZMP
   - Typography/font definitions
   - Spacing and layout variables
   - Global component styling

2. **Header Component (`blocks/header/header.js` & `.css`)**
   - NZMP logo
   - Navigation menu
   - Region/language selector
   - Mobile responsive menu

3. **Footer Component (`blocks/footer/footer.js` & `.css`)**
   - Company information
   - Footer navigation links
   - Contact information
   - Social media links
   - Legal links

4. **Hero Block Enhancements (`blocks/hero/`)**
   - Support for CTA buttons
   - Image optimization
   - Text overlay styling
   - Animation/transition effects

### Task 6: Performance Optimization
**Timeline:** Before launch  
**Checklist:**

- [ ] Optimize all images (use PageSpeed Insights)
- [ ] Lazy load below-the-fold content
- [ ] Minimize CSS bundle
- [ ] Defer non-critical JavaScript
- [ ] Use CSS variables for performance
- [ ] Implement image srcset for responsive sizes
- [ ] Test LCP (Largest Contentful Paint) < 2.5s
- [ ] Test FID (First Input Delay) < 100ms
- [ ] Test CLS (Cumulative Layout Shift) < 0.1

### Task 7: Quality Assurance
**Timeline:** Final testing phase  
**Test Cases:**

**Functional Testing:**
- [ ] All links navigate correctly
- [ ] All buttons trigger appropriate actions
- [ ] Form submissions work (if applicable)
- [ ] Navigation menu opens/closes
- [ ] Mobile menu functions properly

**Visual Testing:**
- [ ] Desktop view (1920x1080, 1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Verify no overflow on any viewport
- [ ] Check typography hierarchy
- [ ] Verify color contrast (WCAG AA)

**Performance Testing:**
- [ ] PageSpeed Insights score >= 95
- [ ] Mobile PageSpeed score >= 90
- [ ] LCP <= 2.5 seconds
- [ ] FID <= 100 milliseconds
- [ ] CLS <= 0.1

**Accessibility Testing:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present where needed
- [ ] Color contrast meets WCAG AA
- [ ] Heading hierarchy is logical

**Cross-browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Task 8: Code Review & Testing
**Timeline:** Before PR  
**Checklist:**

```bash
# Lint JavaScript
npm run lint:js

# Lint CSS
npm run lint:css

# Run full lint suite
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

**Pre-commit checks:**
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Accessible HTML structure

---

## 🔄 Development Workflow

### Starting the Development Server
```bash
# Install dependencies (if not already done)
npm install

# Start local development server
aem up
# or if installed globally
npm install -g @adobe/aem-cli
aem up

# The server will run at http://localhost:3000
# Content is loaded from author preview
```

### Working with Drafts
Create test HTML files in the `drafts/` folder:
```bash
drafts/
├── home.md              # Home page template
├── about.md             # About page template
└── ... other pages
```

**To view drafts locally:**
1. Create file in `drafts/` folder
2. Server auto-reloads
3. Navigate to `http://localhost:3000/drafts/home.md`

### Building Block Definitions
After adding or modifying block models:
```bash
npm run build:json
```

This aggregates:
- `component-definitions.json` - Component types available in Universal Editor
- `component-models.json` - Field definitions for each component
- `component-filters.json` - Filter rules for valid component nesting

### Testing with AEM Author Preview
1. Content in AEM automatically available at author preview URL
2. Use `/tools/aem.js` to test content loading
3. Run `curl http://localhost:3000/path/to/page` to inspect HTML structure

---

## 📊 Block Architecture

### applications-grid Block
**Purpose:** Display 6 application category cards  
**Input Structure:**
```
Row 1: Image | Title + Description + Link
Row 2: Image | Title + Description + Link
... (up to 6 rows)
```

**Features:**
- Responsive grid (1 column mobile, 2 tablet, 3 desktop)
- Hover effects on cards
- Image optimization
- Semantic HTML structure

**Component Model:**
- `image` (reference) - Application icon/image
- `title` (text) - Application name
- `description` (richtext) - Application description
- `link` (text) - Link URL
- `linkText` (text) - "Learn More" or similar

### news-feed Block
**Purpose:** Display latest news articles  
**Input Structure:**
```
Row 1: Image | Title + Date + Excerpt + Link
Row 2: Image | Title + Date + Excerpt + Link
... (up to 6 rows)
```

**Features:**
- Responsive grid layout
- Hover effects on articles
- Date formatting support
- Excerpt text truncation (3 lines)
- Image optimization

**Component Model:**
- `image` (reference) - Article feature image
- `title` (text) - Article title
- `date` (text) - Publication date
- `excerpt` (richtext) - Article preview text
- `link` (text) - Full article URL
- `linkText` (text) - "Read More" or similar

---

## 🎨 Styling Standards

All CSS follows these principles:

1. **Mobile-first approach**
   - Base styles are for mobile
   - Use `@media (min-width: 600px)` for tablet
   - Use `@media (min-width: 900px)` for desktop

2. **CSS Custom Properties**
   ```css
   --color-primary: #0066cc;
   --color-text: #1a1a1a;
   --spacing-unit: 1rem;
   ```

3. **Scoped Selectors**
   - Always scope to block class: `.{blockname}`
   - Don't use generic class names like `.container`

4. **Performance**
   - Minimize CSS in main stylesheet
   - Use `lazy-styles.css` for below-the-fold content
   - Avoid expensive selectors

---

## 🚀 Next Steps

### Immediate (Today)
1. Confirm AEM credentials are valid ✅
2. Review home page content template
3. Identify hero images needed
4. Start asset collection

### This Week
1. Run AEM setup script to create content structure
2. Test blocks locally with `aem up`
3. Upload and optimize homepage images
4. Create home page content in AEM
5. Implement header/footer branding

### Next Week
1. Run performance tests
2. Fix PageSpeed issues
3. QA testing across browsers
4. Code review and linting
5. Create PR with detailed description

---

## 📝 Important Notes

### AEM Content Model
- Content is authored in AEM Universal Editor
- Content is stored at `/content/fonterra-demo/`
- Published content accessible via Content Delivery API
- Changes sync automatically to preview and live environments

### Code & Blocks
- Blocks are defined in `/blocks/` directory
- JS/CSS/JSON files are version controlled in Git
- Component definitions auto-generate from block files
- No manual definition files needed

### Image Optimization
- AEM automatically optimizes uploaded images
- All images should be pre-optimized before upload (max 500KB)
- Use WebP format for better performance
- Maintain high resolution originals (2400px width minimum)

### Performance Targets
- **PageSpeed Desktop:** >= 95
- **PageSpeed Mobile:** >= 90
- **LCP:** <= 2.5s
- **FID:** <= 100ms
- **CLS:** <= 0.1

---

## 🔗 References

- AEM Developer Docs: https://www.aem.live/developer/
- Edge Delivery Services: https://www.aem.live/
- Boilerplate Project: https://github.com/adobe-rnd/aem-boilerplate-xwalk/
- GitHub Repo: https://github.com/LegoKam/fonterra-demo
- Live Site: https://main--fonterra-demo--legokam.aem.live/
- Preview Site: https://main--fonterra-demo--legokam.aem.page/
- AEM Author: https://author-p152232-e1579634.adobeaemcloud.com

---

## 📞 Contact & Support

For questions about the migration:
- Technical: Check AEM documentation at https://www.aem.live/developer/
- Content: Contact content team for authoring guidelines
- Assets: Provide images to team for optimization and upload

---

**Last Updated:** 2026-08-13  
**Next Review:** 2026-08-20  
**Status:** Phase 1 - Foundation Building
