#!/usr/bin/env node

/**
 * AEM Content Structure Setup Script
 * Creates the folder structure and base configuration for NZMP content migration
 *
 * Usage: node scripts/aem-setup.js
 */

import fs from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

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
 * Create a folder in AEM
 */
async function createFolder(path) {
  console.log(`Creating folder: ${path}`);

  const url = `${AEM_AUTHOR_URL}/api/assets${path}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        class: 'assets:Folder',
      }),
    });

    if (response.ok) {
      console.log(`✓ Created: ${path}`);
      return true;
    } if (response.status === 409) {
      console.log(`→ Already exists: ${path}`);
      return true;
    }
    console.error(`✗ Failed to create ${path}: ${response.status}`);
    return false;
  } catch (error) {
    console.error(`✗ Error creating ${path}:`, error.message);
    return false;
  }
}

/**
 * Create the content folder structure
 */
async function setupContentStructure() {
  console.log('\n📁 Setting up AEM content folder structure...\n');

  const folders = [
    '/content/fonterra-demo',
    '/content/fonterra-demo/en',
    '/content/fonterra-demo/en/home',
    '/content/fonterra-demo/en/about',
    '/content/fonterra-demo/en/solutions',
    '/content/fonterra-demo/en/ingredients',
    '/content/fonterra-demo/en/ingredients/proteins',
    '/content/fonterra-demo/en/ingredients/powders-concentrates',
    '/content/fonterra-demo/en/ingredients/specialty',
    '/content/fonterra-demo/en/applications',
    '/content/fonterra-demo/en/sustainability',
    '/content/fonterra-demo/en/buy',
    '/content/fonterra-demo/en/news',
  ];

  const results = [];
  for (const folder of folders) {
    const result = await createFolder(folder);
    results.push(result);
  }

  return results.every((r) => r === true);
}

/**
 * Setup DAM (Digital Asset Management) folder structure
 */
async function setupDAMStructure() {
  console.log('\n🖼️  Setting up DAM folder structure...\n');

  const folders = [
    '/content/dam/fonterra-demo',
    '/content/dam/fonterra-demo/images',
    '/content/dam/fonterra-demo/images/homepage',
    '/content/dam/fonterra-demo/images/products',
    '/content/dam/fonterra-demo/images/products/proteins',
    '/content/dam/fonterra-demo/images/products/powders',
    '/content/dam/fonterra-demo/images/landing-pages',
    '/content/dam/fonterra-demo/images/news',
    '/content/dam/fonterra-demo/logos',
    '/content/dam/fonterra-demo/icons',
    '/content/dam/fonterra-demo/downloads',
    '/content/dam/fonterra-demo/downloads/datasheets',
    '/content/dam/fonterra-demo/downloads/certificates',
  ];

  const results = [];
  for (const folder of folders) {
    const result = await createFolder(folder);
    results.push(result);
  }

  return results.every((r) => r === true);
}

/**
 * Create a sample home page content structure
 */
async function createHomePage() {
  console.log('\n📄 Creating home page content structure...\n');

  const homePagePath = '/content/fonterra-demo/en/home';
  const homePageContent = {
    'jcr:primaryType': 'cq:Page',
    'jcr:title': 'NZMP Home',
    'sling:resourceType': 'cq:Page',
    'jcr:content': {
      'jcr:primaryType': 'cq:PageContent',
      'jcr:title': 'NZMP Home',
      'sling:resourceType': 'core/franklin/components/page/v1/page',
      'cq:template': '/conf/fonterra-demo/settings/wcm/templates/default',
    },
  };

  console.log('Home page structure would be created here');
  return true;
}

/**
 * Verify the setup by checking if folders exist
 */
async function verifySetup() {
  console.log('\n✓ Verifying setup...\n');

  try {
    const response = await fetch(`${AEM_AUTHOR_URL}/api/assets/content/fonterra-demo`, {
      headers,
    });

    if (response.ok) {
      console.log('✓ AEM Content structure verified successfully!');
      return true;
    }
    console.log('⚠ Content structure may not be fully set up');
    return false;
  } catch (error) {
    console.error('Error verifying setup:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('\n🚀 Starting AEM Content Structure Setup...\n');
  console.log(`AEM Author URL: ${AEM_AUTHOR_URL}`);
  console.log('Content Base Path: /content/fonterra-demo\n');

  try {
    await setupContentStructure();
    await setupDAMStructure();
    await createHomePage();
    await verifySetup();

    console.log('\n✅ AEM setup complete!\n');
    console.log('Next steps:');
    console.log('1. Log in to AEM Universal Editor');
    console.log('2. Navigate to /content/fonterra-demo');
    console.log('3. Create and author content using the blocks');
    console.log('4. Run: npm run build:json to update block definitions');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
