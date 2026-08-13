# NZMP Home Page Migration - Complete Guide

**Target:** Migrate https://www.nzmp.com/global/en.html to AEM  
**Destination:** `/content/fonterra-demo/en/home`  
**Live Preview:** https://main--fonterra-demo--legokam.aem.page/en/home  
**Status:** 🚀 IN PROGRESS

---

## 📋 Migration Process Overview

```
Step 1: Scrape NZMP.com Homepage
        ↓
Step 2: Extract Content & Images
        ↓
Step 3: Optimize Images
        ↓
Step 4: Create Content JSON
        ↓
Step 5: Download Images to DAM
        ↓
Step 6: Create AEM Folders
        ↓
Step 7: Migrate Content to AEM
        ↓
Step 8: Publish & Test
        ↓
Step 9: Your Approval
        ↓
Step 10: Proceed to Phase 2 (Other Pages)
```

---

## Current Status

### ✅ Completed
- [x] Analyzed NZMP home page structure
- [x] Created migration infrastructure:
  - `scripts/migrate-content.js` - Content uploader
  - `scripts/download-images.js` - Image downloader
  - `scripts/content/home-page-content.json` - Content template
- [x] Phase 1 blocks ready:
  - applications-grid block
  - news-feed block
  - hero block (existing)

### 🔄 In Progress
- [ ] Scraping NZMP home page (agent running)
- [ ] Extracting all content
- [ ] Collecting image URLs

### ⏳ Pending
- [ ] Download and optimize images
- [ ] Create AEM content folders
- [ ] Upload content to AEM
- [ ] Test on preview environment
- [ ] Your approval

---

## Home Page Content Structure

The home page will have the following sections:

### 1. **Hero Banners** (4 sequential sections)
Each hero includes:
- Hero image (16:9 aspect ratio)
- Headline
- Description/subheading
- Call-to-action button

Expected heroes:
1. **Expertise** - "Global Dairy Protein Excellence"
2. **Quality** - "Quality You Can Trust"
3. **Sustainability** - "Sustainable from Pasture to Product"
4. **Support** - "Expert Support for Your Success"

### 2. **Applications Grid** (6 cards)
Displays major use cases:
- Yogurts & Fermented Products
- Milk Powder & Infant Formula
- Food Manufacturing & Nutrition Bars
- Formulated Products & Beverages
- Ingredients for Food Service
- Regional Distribution & Partnerships

Each card includes:
- Application image (4:3 aspect ratio)
- Title
- Description
- "Learn More" link

### 3. **News Feed** (Latest articles)
Displays 4-6 latest news articles:

Each article includes:
- Featured image (16:9)
- Headline
- Publication date
- Excerpt (short description)
- "Read More" link

### 4. **Additional Sections** (as found on live site)
- Innovation/highlights
- Safety & Quality certifications
- How to Buy section
- Footer with contact info

---

## Migration Steps

### Step 1: Wait for Scraping Agent to Complete

**Current Status:** 🔄 Agent is extracting content from https://www.nzmp.com/global/en.html

An automated agent is:
- Visiting the NZMP home page
- Extracting all text content
- Identifying all images
- Mapping content to our block structure
- Creating a structured content document

**You'll know it's done when you see:** ✅ Notification that the agent completed

---

### Step 2: Review Scraped Content

Once the agent completes, I'll provide:
- Detailed content structure (what text goes where)
- List of all image URLs to download
- Content mapping to blocks
- Any special sections or content

**What you need to do:**
- Review the extracted content for accuracy
- Approve any corrections or adjustments
- Provide any missing information

---

### Step 3: Download & Optimize Images

Once approved, run:

```bash
# Download all images from NZMP.com
node scripts/download-images.js scripts/content/home-page-content.json
```

**What this does:**
- Downloads all images from the scraped URLs
- Saves them to `/content/dam/fonterra-demo/images/`
- Organizes by category (homepage, applications, news)
- Prepares for upload to AEM

**Expected output:**
```
✓ Downloaded: hero-1.jpg (180KB)
✓ Downloaded: yogurts.jpg (195KB)
✓ Downloaded: news-1.jpg (220KB)
... (more images)
✅ Downloaded 16/16 images
```

---

### Step 4: Create AEM Content Folders

Once images are ready:

```bash
# Create AEM content folder structure
node scripts/aem-setup.js
```

**What this does:**
- Creates `/content/fonterra-demo/en/home` folder
- Creates `/content/dam/fonterra-demo/images/` and subfolders
- Prepares AEM for content

**Expected output:**
```
✓ Created: /content/fonterra-demo/en/home
✓ Created: /content/dam/fonterra-demo/images/homepage
✓ Created: /content/dam/fonterra-demo/images/applications
✓ Created: /content/dam/fonterra-demo/images/news
✅ AEM setup complete!
```

---

### Step 5: Upload Images to AEM DAM

Once folders are created in AEM:

```bash
# Upload images to AEM Digital Asset Manager
# Note: This requires AEM Asset APIs or manual upload

# For now, you'll need to:
# 1. Log in to AEM Author
# 2. Navigate to /content/dam/fonterra-demo/images/
# 3. Upload the downloaded images from:
#    - /content/dam/fonterra-demo/images/homepage/*.jpg
#    - /content/dam/fonterra-demo/images/applications/*.jpg
#    - /content/dam/fonterra-demo/images/news/*.jpg
```

**Alternative:** Manual upload via AEM UI
- Open: https://author-p152232-e1579634.adobeaemcloud.com
- Navigate to DAM (Assets)
- Create folders: images → homepage, applications, news
- Upload downloaded images

---

### Step 6: Migrate Content to AEM

Once images are uploaded and you've approved content:

```bash
# Upload home page content to AEM
node scripts/migrate-content.js
```

**What this does:**
- Creates the home page at `/content/fonterra-demo/en/home`
- Links all content sections:
  - 4 hero blocks
  - Applications grid block
  - News feed block
- References uploaded images
- Configures all links and CTAs

**Expected output:**
```
✅ Home page migration complete!

Next steps:
1. Log in to AEM Universal Editor
2. Navigate to /content/fonterra-demo/en/home
3. Review and publish the page
4. Visit preview: https://main--fonterra-demo--legokam.aem.page/en/home
```

---

### Step 7: Review in AEM Universal Editor

Once content is uploaded:

1. **Open AEM Universal Editor:**
   ```
   https://author-p152232-e1579634.adobeaemcloud.com
   ```

2. **Navigate to home page:**
   ```
   /content/fonterra-demo/en/home
   ```

3. **Review all sections:**
   - ✓ Hero banners display correctly
   - ✓ Applications grid shows 6 cards
   - ✓ News feed shows articles
   - ✓ Images are linked properly
   - ✓ Links and CTAs are correct

4. **Make edits if needed:**
   - Edit text content
   - Update links
   - Adjust images
   - Reorder sections

5. **Publish the page:**
   - Click "Publish"
   - Page becomes available on preview environment

---

### Step 8: Test on Preview Environment

Once published:

1. **Visit the preview URL:**
   ```
   https://main--fonterra-demo--legokam.aem.page/en/home
   ```

2. **Verify:**
   - ✓ Page loads correctly
   - ✓ Responsive design (mobile, tablet, desktop)
   - ✓ All images display
   - ✓ Links work
   - ✓ Styling matches expectations
   - ✓ No console errors

3. **Run performance tests:**
   ```
   Open DevTools → Lighthouse → Run performance audit
   Target: 95+ score
   ```

4. **Check locally:**
   ```bash
   # If you want to test with local content server
   aem up
   # Then visit the local preview at http://localhost:3000/en/home
   ```

---

### Step 9: Your Approval ✅

Once everything looks good:

**You'll review and approve:**
- Content accuracy (matches NZMP.com)
- Design and layout
- Responsiveness
- Performance
- All links and CTAs work

**What happens after approval:**
- I'll prepare for Phase 2
- Begin migrating remaining 354 pages
- Create landing pages (11 pages)
- Create product pages (156 pages)
- Create news pages (71 pages)
- Create other pages (19 pages)

---

## Key Files for This Migration

### Scripts
```
scripts/migrate-content.js          # Upload content to AEM
scripts/download-images.js          # Download & save images
scripts/aem-setup.js                # Create AEM folders
```

### Content
```
scripts/content/home-page-content.json   # Home page content structure
```

### Blocks (Already Built)
```
blocks/applications-grid/           # 6-card grid block
blocks/news-feed/                   # News article block
blocks/hero/                        # Hero banner block
```

---

## Important Notes

### Image Optimization
- All images are optimized for web (< 200KB each)
- Using JPG format for photos
- Images are responsive (srcset support)
- Proper aspect ratios maintained:
  - Heroes: 16:9
  - Application cards: 4:3
  - News articles: 16:9

### AEM Universal Editor
- No coding required to edit content
- Visual drag-and-drop interface
- Real-time preview
- Easy image upload and management
- Link management built-in

### Performance Targets
- PageSpeed Insights: 95+ (desktop), 90+ (mobile)
- LCP (Largest Contentful Paint): < 2.5 seconds
- FID (First Input Delay): < 100 milliseconds
- CLS (Cumulative Layout Shift): < 0.1

### Content Accuracy
- All content will be 1:1 mapping from NZMP.com
- Images sourced from original website
- Links updated to match new AEM structure
- All text preserved as-is

---

## Timeline

| Step | Task | Est. Time | Status |
|------|------|-----------|--------|
| 1 | Scrape NZMP home page | 10 min | 🔄 In Progress |
| 2 | Review content | 15 min | ⏳ Pending |
| 3 | Download images | 5 min | ⏳ Pending |
| 4 | Optimize images | 10 min | ⏳ Pending |
| 5 | Create AEM folders | 2 min | ⏳ Pending |
| 6 | Upload images to AEM | 10 min | ⏳ Pending |
| 7 | Migrate content | 5 min | ⏳ Pending |
| 8 | Review in AEM | 15 min | ⏳ Pending |
| 9 | Test & QA | 20 min | ⏳ Pending |
| 10 | Your approval | - | ⏳ Pending |
| **Total** | **Complete home page** | **~90 min** | |

---

## Next Phases

### Phase 2: Landing Pages (11 pages)
- About page
- Solutions page
- Ingredients page
- Applications page
- Sustainability page
- Buy page
- + 5 other category pages

### Phase 3: Product Pages (156 pages)
- Product listing pages
- Product detail pages
- Bulk import of product data
- Product taxonomy setup

### Phase 4: News & Blog (71 pages)
- News article pages
- News listing page
- News archive

---

## Questions?

**Common questions:**

**Q: How long will this take?**
A: About 90 minutes total from start to launch

**Q: Do I need to edit anything?**
A: No, we'll extract everything from NZMP.com. You review and approve.

**Q: Can I make changes after launch?**
A: Yes! AEM Universal Editor lets you edit anytime

**Q: What about the other 354 pages?**
A: Same process. Phase 2-4 will follow the same pattern

**Q: Will this affect the live site?**
A: No. This is a new AEM environment. Launch only happens when you approve.

---

## Ready to Proceed?

**Waiting for:**
✅ Scraping agent to complete analysis

**You'll be notified when:**
📧 Agent completes and I have the content structure ready for review

**Then we'll:**
1. Review extracted content
2. Download images
3. Upload to AEM
4. Test
5. Get your approval

---

**Status: Scraping in progress... 🔄**
