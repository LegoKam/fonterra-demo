#!/usr/bin/env node

/**
 * NZMP Content Migration Script
 * Migrates home page content to AEM
 *
 * Usage: node scripts/migrate-content.js
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load .env
const envContent = fs.readFileSync(path.join(projectRoot, '.env'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const { AEM_JWT_TOKEN, AEM_AUTHOR_URL } = envVars;

const headers = {
  Authorization: `Bearer ${AEM_JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

/**
 * Upload content to AEM
 */
async function uploadContent(path, content) {
  console.log(`Uploading content: ${path}`);

  const url = `${AEM_AUTHOR_URL}/api/v1/sites/fonterra-demo/pages${path}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(content),
    });

    if (response.ok) {
      console.log(`✓ Uploaded: ${path}`);
      return true;
    }
    console.error(`✗ Failed: ${response.status} - ${response.statusText}`);
    return false;
  } catch (error) {
    console.error(`✗ Error uploading ${path}:`, error.message);
    return false;
  }
}

/**
 * Create hero block section
 */
function createHeroSection(title, description, image, cta) {
  return {
    type: 'hero',
    title,
    description,
    image,
    cta: {
      text: cta.text,
      url: cta.url,
    },
  };
}

/**
 * Create applications grid section
 */
function createApplicationsSection(applications) {
  return {
    type: 'applications-grid',
    applications: applications.map(app => ({
      title: app.title,
      description: app.description,
      image: app.image,
      link: app.link,
      linkText: app.linkText || 'Learn More',
    })),
  };
}

/**
 * Create news feed section
 */
function createNewsFeedSection(articles) {
  return {
    type: 'news-feed',
    articles: articles.map(article => ({
      title: article.title,
      date: article.date,
      excerpt: article.excerpt,
      image: article.image,
      link: article.link,
      linkText: article.linkText || 'Read More',
    })),
  };
}

/**
 * Migrate home page content
 */
async function migrateHomePage(contentData) {
  console.log('\n📄 Migrating home page content...\n');

  // Build the page structure from content data
  const page = {
    title: contentData.title || 'NZMP Home',
    description: contentData.description || 'NZMP - New Zealand Milk Products',
    sections: [],
  };

  // Add hero sections
  if (contentData.heros && Array.isArray(contentData.heros)) {
    contentData.heros.forEach((hero) => {
      page.sections.push(createHeroSection(
        hero.title,
        hero.description,
        hero.image,
        hero.cta,
      ));
    });
  }

  // Add applications grid
  if (contentData.applications && Array.isArray(contentData.applications)) {
    page.sections.push(createApplicationsSection(contentData.applications));
  }

  // Add news feed
  if (contentData.news && Array.isArray(contentData.news)) {
    page.sections.push(createNewsFeedSection(contentData.news));
  }

  // Upload to AEM
  const success = await uploadContent('/en/home', page);

  if (success) {
    console.log('\n✅ Home page migration complete!');
    console.log('\nNext steps:');
    console.log('1. Log in to AEM Universal Editor');
    console.log('2. Navigate to /content/fonterra-demo/en/home');
    console.log('3. Review and publish the page');
    console.log('4. Visit preview: https://main--fonterra-demo--legokam.aem.page/en/home');
  } else {
    console.log('\n❌ Migration failed');
    process.exit(1);
  }
}

/**
 * Load content from JSON file
 */
function loadContentFromFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Content file not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Main migration function
 */
async function main() {
  console.log('\n🚀 Starting NZMP Home Page Migration...\n');
  console.log(`AEM Author URL: ${AEM_AUTHOR_URL}`);
  console.log('Content Source: scripts/content/home-page-content.json\n');

  try {
    // Load content from JSON file
    const contentData = loadContentFromFile('scripts/content/home-page-content.json');

    // Validate content structure
    if (!contentData.title) {
      throw new Error('Content missing required field: title');
    }

    // Migrate the home page
    await migrateHomePage(contentData);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
