#!/usr/bin/env node

/**
 * Image Download & Optimization Script
 * Downloads images from URLs and optimizes them for web
 *
 * Usage: node scripts/download-images.js <json-file>
 * Example: node scripts/download-images.js scripts/content/home-page-content.json
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

/**
 * Download an image from URL
 */
async function downloadImage(url, outputPath) {
  try {
    console.log(`Downloading: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`✗ Failed to download ${url}: ${response.status}`);
      return false;
    }

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✓ Downloaded: ${path.basename(outputPath)} (${sizeKB}KB)`);

    return true;
  } catch (error) {
    console.error(`✗ Error downloading ${url}:`, error.message);
    return false;
  }
}

/**
 * Extract image URLs from content data
 */
function extractImageUrls(content) {
  const images = [];

  // Extract from hero sections
  if (content.heros && Array.isArray(content.heros)) {
    content.heros.forEach((hero, index) => {
      if (hero.image) {
        images.push({
          url: hero.image,
          type: 'hero',
          name: `hero-${index + 1}.jpg`,
          dir: 'homepage',
        });
      }
    });
  }

  // Extract from applications
  if (content.applications && Array.isArray(content.applications)) {
    content.applications.forEach((app) => {
      if (app.image) {
        images.push({
          url: app.image,
          type: 'application',
          name: app.title.toLowerCase().replace(/\s+/g, '-'),
          dir: 'applications',
        });
      }
    });
  }

  // Extract from news
  if (content.news && Array.isArray(content.news)) {
    content.news.forEach((article, index) => {
      if (article.image) {
        images.push({
          url: article.image,
          type: 'news',
          name: `news-${index + 1}.jpg`,
          dir: 'news',
        });
      }
    });
  }

  return images;
}

/**
 * Download all images from content
 */
async function downloadAllImages(contentPath) {
  console.log('\n🖼️  Starting image download...\n');

  // Load content file
  const fullPath = path.join(projectRoot, contentPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Content file not found: ${contentPath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  // Extract image URLs
  const images = extractImageUrls(content);

  if (images.length === 0) {
    console.log('No images found in content');
    return;
  }

  console.log(`Found ${images.length} images to download\n`);

  // Download each image
  let successCount = 0;
  for (const image of images) {
    const outputPath = path.join(
      projectRoot,
      'content/dam/fonterra-demo/images',
      image.dir,
      `${image.name}.jpg`,
    );

    const success = await downloadImage(image.url, outputPath);
    if (success) {
      successCount += 1;
    }
  }

  console.log(`\n✅ Downloaded ${successCount}/${images.length} images`);
  console.log(`\nImages saved to: /content/dam/fonterra-demo/images/`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/download-images.js <json-file>');
    console.log('Example: node scripts/download-images.js scripts/content/home-page-content.json');
    process.exit(1);
  }

  const contentPath = args[0];

  try {
    await downloadAllImages(contentPath);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
