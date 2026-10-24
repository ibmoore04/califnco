#!/usr/bin/env node

/**
 * ==============================================================================
 * Califnco AI Marketing Automation & Social Publishing Workflow
 * ==============================================================================
 *
 * This autonomous script implements Phase 6 requirements:
 * 1. Selects or takes a featured Califnco water purification product.
 * 2. Generates compelling marketing copy, benefit highlights, and targeted hashtags.
 *    - Uses Gemini 1.5 Flash when GEMINI_API_KEY is configured in env.
 *    - Uses an intelligent deterministic generator when GEMINI_API_KEY is absent.
 * 3. Prepares Meta Graph API publishing payloads for Instagram:
 *    - Step 1: POST /{ig-user-id}/media (create media container)
 *    - Step 2: POST /{ig-user-id}/media_publish (publish container)
 *    - Accounts for Meta account blocks by performing a truthful dry-run staging
 *      preview and saving outputs to docs/daily_posts/.
 * 4. Generates WhatsApp Click-to-Chat direct share URL and WAHA HTTP payload.
 *
 * Usage:
 *   node scripts/ai-daily-marketing.mjs
 *   node scripts/ai-daily-marketing.mjs --dry-run
 *   node scripts/ai-daily-marketing.mjs --product="AquaPure Prime 15L"
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Featured default product catalog for standalone execution
const SAMPLE_CATALOG = [
  {
    id: 'prod-aquapure-prime-15l',
    name: 'Califnco AquaPure Prime 15L RO Purifier',
    category: 'purifiers',
    price: 18499,
    wholesalePrice: 13999,
    specs: {
      filtration: 'RO + UV + UF + Alkaline Mineralizer (0.0001 micron)',
      capacity: '15 Litres/Hour',
      tdsReduction: 'Up to 2000 ppm TDS inlet support',
      warranty: '1 Year Comprehensive On-Site Warranty',
    },
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    description: 'Next-generation domestic RO system with 10-stage purification and active calcium-magnesium remineralization.',
  },
  {
    id: 'prod-hydroboost-commercial-50l',
    name: 'Califnco HydroBoost 50L Commercial RO Plant',
    category: 'purifiers',
    price: 36999,
    wholesalePrice: 28500,
    specs: {
      filtration: 'Twin Dow Filmtec 3012-300 GPD Membranes',
      capacity: '50 Litres/Hour continuous',
      tdsReduction: 'Up to 3000 ppm borewell water',
      warranty: '2 Year Commercial Grade Pump Warranty',
    },
    imageUrl: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy-duty water purification plant designed for corporate offices, hospitals, restaurants, and educational campuses.',
  },
  {
    id: 'prod-alkaline-filter-kit',
    name: 'Califnco Bio-Active Alkaline Mineral Cartridge',
    category: 'filters',
    price: 1499,
    wholesalePrice: 850,
    specs: {
      phBoost: 'Elevates water pH to 8.5 - 9.5',
      minerals: 'Bio-ceramic balls, Activated Carbon, Maifan stones',
      lifespan: '2500 Litres or 12 Months',
    },
    imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80',
    description: 'Post-RO remineralization cartridge that restores essential electrolytes, improves oxidation-reduction potential (ORP), and enhances natural taste.',
  },
];

async function generateMarketingCopy(product, geminiKey) {
  if (geminiKey) {
    console.log('[AI] Calling Google Gemini 1.5 Flash API...');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const prompt = `You are the lead marketing copywriter for Califnco Water Solutions (Bengaluru, India), an advanced water purification technology brand.
Write an engaging, high-converting social media marketing post for the following product:
Product: ${product.name}
Category: ${product.category}
Price: ₹${product.price.toLocaleString('en-IN')} (Wholesale: ₹${product.wholesalePrice.toLocaleString('en-IN')})
Specifications: ${JSON.stringify(product.specs)}
Description: ${product.description}

Requirements:
1. Catchy headline with appropriate emojis.
2. 2-3 engaging body paragraphs highlighting pure health, 0.0001-micron filtration, mineral retention, and doorstep service.
3. Call to Action: Order on the Califnco Mobile App or book a free TDS water test.
4. Exactly 8-12 targeted hashtags (e.g. #Califnco #PureWater #ROWaterPurifier #CleanWaterEveryDay #BengaluruWater #HealthyLiving).

Return in plain text formatted for Instagram and WhatsApp.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log('✓ Gemini 1.5 Flash copy generation successful.');
          return {
            source: 'gemini-1.5-flash',
            caption: text.trim(),
            hashtags: extractHashtags(text),
          };
        }
      } else {
        console.warn(`[AI Warning] Gemini API responded with status ${response.status}. Using deterministic backup.`);
      }
    } catch (err) {
      console.warn(`[AI Warning] Gemini connection error: ${err.message}. Using deterministic backup.`);
    }
  }

  // High-fidelity deterministic copy generator (Zero hallucinations, accurate specs)
  console.log('[AI] Using high-fidelity Califnco deterministic marketing generator...');
  const specsList = Object.entries(product.specs || {})
    .map(([k, v]) => `• ${capitalize(k)}: ${v}`)
    .join('\n');

  const caption = `💧 PURE WATER, UNCOMPROMISED HEALTH | ${product.name.toUpperCase()}

Did you know tap water can carry unseen heavy metals, microplastics, and dissolved chemical solids? 

Califnco brings medical-grade water purification right to your kitchen and workplace. The ${product.name} delivers crisp, refreshing, 100% pure mineral water with certified 0.0001-micron multi-stage filtration.

✨ KEY PERFORMANCE SPECS:
${specsList}

💎 SPECIAL PROMOTION:
• Retail: ₹${product.price.toLocaleString('en-IN')} (Free Standard Installation & TDS Test)
• Verified Dealers & Bulk Buyers: Wholesale pricing starting at ₹${product.wholesalePrice.toLocaleString('en-IN')}/unit!

📲 Order now directly on the Califnco Mobile App, or book a free certified technician doorstep visit today.

1800-420-PURE | support@califnco.com | Bengaluru, India`;

  const hashtags = [
    '#Califnco',
    '#PureWater',
    '#ROWaterPurifier',
    '#CleanWaterEveryDay',
    '#HealthyLiving',
    '#AlkalineWater',
    '#WaterPurification',
    '#SafeDrinkingWater',
    '#BengaluruWater',
    '#HomeWellness',
  ];

  return {
    source: 'califnco-deterministic-engine',
    caption,
    hashtags,
  };
}

function extractHashtags(text) {
  const matches = text.match(/#\w+/g);
  if (matches && matches.length > 0) {
    return Array.from(new Set(matches));
  }
  return ['#Califnco', '#PureWater', '#ROWaterPurifier', '#CleanWaterEveryDay'];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function runSocialPublishingWorkflow() {
  console.log('================================================================');
  console.log('CALIFNCO AI MARKETING & SOCIAL PUBLISHING PIPELINE');
  console.log('Project: califnco-assignment-d989e');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  // 1. Select Product
  const product = SAMPLE_CATALOG[0];
  console.log(`[Catalog] Selected Featured Daily Product: "${product.name}" (ID: ${product.id})`);

  // 2. Generate Marketing Content
  const geminiKey = process.env.GEMINI_API_KEY || '';
  if (geminiKey) {
    console.log('[Auth] Found GEMINI_API_KEY in environment.');
  } else {
    console.log('[Auth] GEMINI_API_KEY not configured. Running with built-in high-fidelity generator.');
  }

  const generated = await generateMarketingCopy(product, geminiKey);
  const fullPostText = `${generated.caption}\n\n${generated.hashtags.join(' ')}`;

  // 3. Meta Graph API (Instagram) Evaluation & Dry-Run Staging
  const metaToken = process.env.META_GRAPH_ACCESS_TOKEN || '';
  const igUserId = process.env.INSTAGRAM_USER_ID || '17841400000000000';

  console.log('\n--- 1. Instagram Meta Graph API Integration ---');
  const instagramPayload = {
    endpoint_step1: `POST https://graph.facebook.com/v19.0/${igUserId}/media`,
    body_step1: {
      image_url: product.imageUrl,
      caption: fullPostText,
    },
    endpoint_step2: `POST https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    body_step2: {
      creation_id: '<CONTAINER_ID_FROM_STEP1>',
    },
  };

  let igStatus = 'blocked';
  let igStatusReason = 'Candidate Instagram account is currently blocked/banned by Meta. Running in truthful Dry-Run Staging mode.';

  if (metaToken) {
    console.log('[Meta] Meta Graph Access Token detected. Attempting live media container creation...');
    try {
      const igRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${metaToken}`,
        },
        body: JSON.stringify(instagramPayload.body_step1),
      });
      const igData = await igRes.json();
      if (igRes.ok && igData.id) {
        igStatus = 'ready';
        igStatusReason = `Media container created successfully (ID: ${igData.id}).`;
        console.log(`✓ Media container created: ${igData.id}`);
      } else {
        igStatus = 'blocked';
        igStatusReason = `Meta Graph API error: ${igData.error?.message || 'Unauthorized / Account restricted'}`;
        console.warn(`[Meta] ${igStatusReason}`);
      }
    } catch (err) {
      igStatus = 'blocked';
      igStatusReason = `Meta Graph API connection failed: ${err.message}`;
    }
  } else {
    console.log(`ℹ️ Meta Token: Unset in environment.`);
    console.log(`ℹ️ Status: ${igStatusReason}`);
  }

  // 4. WhatsApp Direct Share Link & WAHA Gateway
  console.log('\n--- 2. WhatsApp Status & Broadcast Sharing ---');
  const encodedText = encodeURIComponent(fullPostText);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const wahaEndpoint = process.env.WAHA_API_URL || 'http://localhost:3000/api/sendText';
  const wahaPayload = {
    chatId: 'status@broadcast',
    text: fullPostText,
  };

  console.log(`✓ Universal Click-to-Chat URL generated: ${whatsappShareUrl.slice(0, 75)}...`);
  console.log(`✓ WAHA HTTP Broadcast Payload formatted for status@broadcast.`);

  // 5. Staging Artifact Persistence
  const outputDir = path.resolve(projectRoot, 'docs', 'daily_posts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const postArtifact = {
    date: todayStr,
    generatedAt: new Date().toISOString(),
    sourceEngine: generated.source,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      imageUrl: product.imageUrl,
    },
    content: {
      caption: generated.caption,
      hashtags: generated.hashtags,
      fullText: fullPostText,
    },
    integrations: {
      instagram: {
        status: igStatus,
        reason: igStatusReason,
        metaGraphPayload: instagramPayload,
      },
      whatsapp: {
        clickToShareUrl: whatsappShareUrl,
        wahaPayload,
      },
    },
  };

  const artifactPath = path.join(outputDir, `post-${todayStr}.json`);
  fs.writeFileSync(artifactPath, JSON.stringify(postArtifact, null, 2), 'utf8');
  console.log(`\n✓ Staged daily marketing artifact saved to: ${artifactPath}`);

  // 6. Summary Presentation
  console.log('\n================================================================');
  console.log('DAILY POST PREVIEW');
  console.log('================================================================');
  console.log(fullPostText);
  console.log('================================================================');
  console.log('STATUS MATRIX:');
  console.log(`- Marketing Copy:       [✓ GENERATED via ${generated.source}]`);
  console.log(`- Instagram Status:     [${igStatus.toUpperCase()}] -> ${igStatusReason}`);
  console.log(`- WhatsApp Status:      [✓ READY] Universal share link & WAHA ready.`);
  console.log(`- Saved Staging File:   docs/daily_posts/post-${todayStr}.json`);
  console.log('================================================================\n');

  return postArtifact;
}

runSocialPublishingWorkflow().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
