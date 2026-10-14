#!/usr/bin/env node

/**
 * Writebolt Blog Setup
 * Seeds the default author, site settings, and AI settings row.
 *
 * Usage: npm run setup
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { randomBytes } from 'crypto';

let envVars = {};
const envPath = resolve(process.cwd(), '.env');
try {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...val] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = val.join('=').trim();
    }
  });
} catch {}

const url = process.env.SUPABASE_URL || envVars.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env');
  process.exit(1);
}

if (!envVars.SETTINGS_ENCRYPTION_KEY && !process.env.SETTINGS_ENCRYPTION_KEY && existsSync(envPath)) {
  const generated = randomBytes(32).toString('hex');
  writeFileSync(envPath, `${readFileSync(envPath, 'utf8').trim()}\nSETTINGS_ENCRYPTION_KEY=${generated}\n`);
  console.log('  ✓ Generated SETTINGS_ENCRYPTION_KEY in .env');
}

const supabase = createClient(url, key);

async function setup() {
  console.log('⚡ Writebolt Blog Setup\n');

  const { data: existingAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('slug', 'admin')
    .single();

  if (!existingAuthor) {
    await supabase.from('authors').insert({
      name: 'Admin',
      slug: 'admin',
      is_default: true,
      role: 'admin',
      is_active: true,
    });
    console.log('  ✓ Default author created');
  } else {
    console.log('  · Default author exists');
  }

  const { data: existingSettings } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existingSettings) {
    await supabase.from('site_settings').insert({
      site_name: 'My Blog',
      site_description: 'A blog powered by Writebolt',
    });
    console.log('  ✓ Site settings created');
  } else {
    console.log('  · Site settings exist');
  }

  const { data: existingAi } = await supabase
    .from('ai_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existingAi) {
    await supabase.from('ai_settings').insert({ image_provider: 'openai' });
    console.log('  ✓ AI settings row created');
  } else {
    console.log('  · AI settings exist');
  }

  console.log('\n✅ Setup complete. Run `npm run dev` to start.\n');
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
