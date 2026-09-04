#!/usr/bin/env node

/**
 * Writebolt Blog Setup
 * Seeds the default author, blog settings, and nav items.
 *
 * Usage: npm run setup
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually (no dotenv dependency needed if using node --env-file)
let envVars = {};
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
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

const supabase = createClient(url, key);

async function setup() {
  console.log('⚡ Writebolt Blog Setup\n');

  // 1. Default author
  const { data: existingAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('slug', 'admin')
    .single();

  if (!existingAuthor) {
    await supabase.from('authors').insert({ name: 'Admin', slug: 'admin', is_default: true });
    console.log('  ✓ Default author created');
  } else {
    console.log('  · Default author exists');
  }

  // 2. Site settings
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

  console.log('\n✅ Setup complete. Run `npm run dev` to start.\n');
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
