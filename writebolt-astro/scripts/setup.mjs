#!/usr/bin/env node

/**
 * Writebolt Blog setup wizard.
 *
 *   npm run setup
 *     Standalone: asks for the Supabase project, then the admin username and password.
 *   npm run setup -- --addon --host /path/to/existing-site
 *     Add-on: copies Supabase from the existing site, then asks for the admin username and password.
 *   npm run setup -- --seed
 *     Seeds again using the .env already written. No questions.
 *
 * Newsletter is not part of setup. Turn it on later in Admin → Settings.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { randomBytes } from 'crypto';
import readline from 'readline';

const root = process.cwd();
const envPath = join(root, '.env');

const URL_KEYS = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'];
const ANON_KEYS = ['SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'];
const SERVICE_KEYS = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const SITE_KEYS = ['SITE_URL', 'NEXT_PUBLIC_SITE_URL', 'PUBLIC_SITE_URL'];
const HOST_ENV_FILES = ['.env', '.env.development', '.env.local', '.env.development.local'];

function parseArgs(argv) {
  const args = { seed: false, addon: false, help: false, host: '' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--seed') args.seed = true;
    else if (arg === '--addon') args.addon = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--host') args.host = argv[++i] || '';
    else if (arg.startsWith('--host=')) args.host = arg.slice('--host='.length);
  }
  return args;
}

function printHelp() {
  console.log(`
Writebolt Blog — setup wizard

  npm run setup
      Standalone blog. Asks for the Supabase project and an admin username and password.

  npm run setup -- --addon --host /path/to/existing-site
      Add-on blog. Copies Supabase from that site, then asks for an admin username and password.

  npm run setup -- --seed
      Seed the database again from the current .env. Does not ask questions.

Newsletter is configured later in Admin → Settings.
`);
}

function parseEnv(text) {
  const vars = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let key = trimmed.slice(0, eq).trim();
    if (key.startsWith('export ')) key = key.slice(7).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) vars[key] = value;
  }
  return vars;
}

function readEnvFile(file) {
  try {
    return parseEnv(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function isPlaceholder(value) {
  if (!value || !String(value).trim()) return true;
  const v = String(value).trim().toLowerCase();
  return (
    v.includes('your-') ||
    v.includes('your_') ||
    v.includes('changeme') ||
    v.includes('paste-') ||
    v === 'xxx'
  );
}

function firstReal(vars, keys) {
  for (const key of keys) {
    const value = vars[key];
    if (value && !isPlaceholder(value)) return value.trim();
  }
  return '';
}

function loadHostEnv(hostDir) {
  const dir = resolve(hostDir);
  const merged = {};
  const found = [];
  for (const name of HOST_ENV_FILES) {
    const file = join(dir, name);
    if (!existsSync(file)) continue;
    Object.assign(merged, readEnvFile(file));
    found.push(file);
  }
  return { dir, files: found, vars: merged };
}

function envLine(key, value) {
  const text = value == null ? '' : String(value);
  if (text === '') return `${key}=`;
  if (/[\s#"'\\]/.test(text)) {
    return `${key}="${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return `${key}=${text}`;
}

function upsertEnv(text, updates) {
  const lines = text.length ? text.split(/\r?\n/) : [];
  const seen = new Set();
  const out = lines.map((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match || !(match[1] in updates)) return line;
    seen.add(match[1]);
    return envLine(match[1], updates[match[1]]);
  });
  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) out.push(envLine(key, value));
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return `${out.join('\n')}\n`;
}

function question(rl, label) {
  return new Promise((resolvePromise) => {
    rl.question(label, (answer) => resolvePromise(String(answer ?? '').trim()));
  });
}

async function askRequired(rl, label, rejectPlaceholder = false) {
  for (;;) {
    const value = await question(rl, label);
    if (!value || (rejectPlaceholder && isPlaceholder(value))) {
      console.log('  That value is required.');
      continue;
    }
    return value;
  }
}

async function askHttp(rl, label, fallback = '') {
  const hint = fallback ? ` [${fallback}]` : '';
  for (;;) {
    const typed = await question(rl, `${label}${hint}: `);
    const value = typed || fallback;
    if (/^https?:\/\/\S+$/i.test(value)) return value.replace(/\/$/, '');
    console.log('  Enter a full URL, including http:// or https://.');
  }
}

function adminUrls(siteUrl, basePath) {
  const origin = String(siteUrl || 'http://localhost:4321').replace(/\/$/, '');
  const raw = String(basePath || '').trim();
  const base = raw && raw !== '/' ? `/${raw.replace(/^\/|\/$/g, '')}` : '';
  return {
    login: `${origin}${base}/admin/login`,
    article: `${origin}${base}/admin/new`,
  };
}

function printDone({ siteUrl, basePath, addon, seeded }) {
  const urls = adminUrls(siteUrl, basePath);
  console.log('\n── Next steps ─────────────────────────────────────────');
  if (!seeded) {
    console.log('The database is not ready yet. In the Supabase SQL editor, run:');
    console.log('  supabase/001_initial_schema.sql');
    console.log('Then seed again with:  npm run setup -- --seed');
  }
  console.log(`Admin: ${urls.login}`);
  console.log(`First article: ${urls.article}`);
  console.log('Sign in with the username and password you just set.');
  if (addon) {
    console.log('If the existing site is already on port 4321, start the blog with:');
    console.log('  npm run dev -- --port 4322');
  } else {
    console.log('Start the blog with:  npm run dev');
  }
  console.log('────────────────────────────────────────────────────────\n');
}

async function seedDatabase(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || isPlaceholder(url) || isPlaceholder(key)) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const supabase = createClient(url, key);
  console.log('⚡ Writebolt Blog Setup\n');

  const author = await supabase.from('authors').select('id').eq('slug', 'admin').maybeSingle();
  if (author.error) throw new Error(author.error.message);
  if (!author.data) {
    const inserted = await supabase.from('authors').insert({
      name: 'Admin',
      slug: 'admin',
      is_default: true,
      role: 'admin',
      is_active: true,
    });
    if (inserted.error) throw new Error(inserted.error.message);
    console.log('  ✓ Default author created');
  } else {
    console.log('  · Default author exists');
  }

  const settings = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
  if (settings.error) throw new Error(settings.error.message);
  if (!settings.data) {
    const basePath = String(env.BLOG_BASE_PATH || '').trim();
    const addon = basePath.length > 0 && basePath !== '/';
    const inserted = await supabase.from('site_settings').insert({
      site_name: 'My Blog',
      site_description: 'A blog powered by Writebolt',
      ...(addon ? { layout_mode: 'embedded' } : {}),
    });
    if (inserted.error) throw new Error(inserted.error.message);
    console.log(addon
      ? '  ✓ Site settings created (add-on: embedded layout, host header and footer)'
      : '  ✓ Site settings created');
  } else {
    console.log('  · Site settings exist');
  }

  const ai = await supabase.from('ai_settings').select('id').limit(1).maybeSingle();
  if (ai.error) throw new Error(ai.error.message);
  if (!ai.data) {
    const inserted = await supabase.from('ai_settings').insert({ image_provider: 'openai' });
    if (inserted.error) throw new Error(inserted.error.message);
    console.log('  ✓ AI settings row created');
  } else {
    console.log('  · AI settings exist');
  }
}

function writeEnv(updates) {
  const current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  const base = current.trim()
    ? current
    : '# Generated by npm run setup — do not commit this file\n';
  const next = { ...updates };
  const existing = parseEnv(base);
  if (!existing.SETTINGS_ENCRYPTION_KEY && !next.SETTINGS_ENCRYPTION_KEY) {
    next.SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString('hex');
    console.log('  ✓ Generated SETTINGS_ENCRYPTION_KEY');
  }
  writeFileSync(envPath, upsertEnv(base, next), 'utf8');
  console.log('  ✓ Wrote .env');
}

async function collectSupabase(rl) {
  console.log('Paste the project URL and API keys from Supabase → Project Settings → API.\n');
  const url = await askHttp(rl, 'Supabase URL');
  const anon = await askRequired(rl, 'Supabase anon key: ', true);
  const service = await askRequired(rl, 'Supabase service role key: ', true);
  return { url, anon, service };
}

async function resolveSupabase(rl, { addon, host, existing }) {
  const own = {
    url: firstReal(existing, ['SUPABASE_URL']),
    anon: firstReal(existing, ['SUPABASE_ANON_KEY']),
    service: firstReal(existing, ['SUPABASE_SERVICE_ROLE_KEY']),
  };
  if (own.url && own.anon && own.service && !addon) return own;

  if (!addon) return collectSupabase(rl);

  let hostDir = host;
  if (!hostDir) {
    hostDir = await question(rl, 'Path to the existing site (the folder that has its .env): ');
  }
  if (!hostDir) {
    console.log('\nNo site folder given. Enter the Supabase project for this blog.\n');
    return collectSupabase(rl);
  }
  if (!existsSync(resolve(hostDir))) {
    console.log(`\nCould not find ${resolve(hostDir)}. Enter the Supabase project for this blog.\n`);
    return collectSupabase(rl);
  }

  const loaded = loadHostEnv(hostDir);
  const found = {
    url: firstReal(loaded.vars, URL_KEYS),
    anon: firstReal(loaded.vars, ANON_KEYS),
    service: firstReal(loaded.vars, SERVICE_KEYS),
    siteUrl: firstReal(loaded.vars, SITE_KEYS),
  };

  if (found.url && found.anon && found.service) {
    const from = loaded.files[0] || loaded.dir;
    console.log('Using the Supabase project already configured on the existing site.');
    console.log(`  ${found.url}`);
    console.log(`  from ${from}\n`);
    const useExisting = (await question(rl, 'Press Enter to use this project, or n to enter a different one: ')).toLowerCase();
    if (useExisting === 'n' || useExisting === 'no') {
      const typed = await collectSupabase(rl);
      return { ...typed, siteUrl: found.siteUrl };
    }
    return found;
  }

  console.log('This site does not already have a Supabase URL and API keys.');
  console.log('The blog stores its articles in Supabase, so those values are needed once.\n');
  const typed = await collectSupabase(rl);
  return { ...typed, siteUrl: found.siteUrl };
}

async function wizard(args) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(`
The setup wizard needs an interactive terminal so you can set the admin username and password.

Open a terminal in writebolt-astro and run:
  ${args.addon ? `npm run setup -- --addon --host ${args.host || '<path to the existing site>'}` : 'npm run setup'}
`);
    process.exit(1);
  }

  const existing = readEnvFile(envPath);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n⚡ Writebolt Blog — setup wizard\n');

  try {
    if (existsSync(envPath) && firstReal(existing, ['SUPABASE_URL']) && firstReal(existing, ['ADMIN_PASSWORD'])) {
      const overwrite = (await question(rl, '.env already exists. Set it up again? [y/N]: ')).toLowerCase();
      if (overwrite !== 'y' && overwrite !== 'yes') {
        rl.close();
        console.log('Keeping the current .env. Seeding with those values.\n');
        let seeded = true;
        try {
          await seedDatabase(existing);
          console.log('\n✅ Setup complete.\n');
        } catch (err) {
          seeded = false;
          console.warn(`\n⚠️  Seed failed: ${err.message}\n`);
        }
        printDone({
          siteUrl: firstReal(existing, SITE_KEYS) || 'http://localhost:4321',
          basePath: existing.BLOG_BASE_PATH || '',
          addon: args.addon || (existing.BLOG_BASE_PATH && existing.BLOG_BASE_PATH !== '/'),
          seeded,
        });
        return;
      }
    }

    const addon = args.addon || (existing.BLOG_BASE_PATH && existing.BLOG_BASE_PATH !== '/' && existing.BLOG_BASE_PATH !== '');
    if (addon) {
      console.log('Add-on install. Articles will be served at /blog.');
      console.log('Newsletter is turned on later in Admin → Settings.\n');
    } else {
      console.log('Standalone install. Articles will be served at /{slug}.');
      console.log('Newsletter is turned on later in Admin → Settings.\n');
    }

    const supabase = await resolveSupabase(rl, { addon, host: args.host, existing });
    const siteFallback = supabase.siteUrl || firstReal(existing, SITE_KEYS) || 'http://localhost:4321';
    const siteUrl = await askHttp(rl, 'Site URL', siteFallback);
    const username = (await question(rl, 'Admin username [admin]: ')) || 'admin';
    const password = await askRequired(rl, 'Admin password: ');
    rl.close();

    const updates = {
      SUPABASE_URL: supabase.url,
      SUPABASE_ANON_KEY: supabase.anon,
      SUPABASE_SERVICE_ROLE_KEY: supabase.service,
      ADMIN_USERNAME: username,
      ADMIN_PASSWORD: password,
      SITE_URL: siteUrl,
      BLOG_BASE_PATH: addon ? '/blog' : '',
    };

    console.log('');
    writeEnv(updates);
    const written = readEnvFile(envPath);

    let seeded = true;
    try {
      await seedDatabase(written);
      console.log('\n✅ Setup complete.\n');
    } catch (err) {
      seeded = false;
      console.warn(`\n⚠️  .env is saved. Seed failed: ${err.message}\n`);
    }
    printDone({ siteUrl, basePath: updates.BLOG_BASE_PATH, addon, seeded });
  } catch (err) {
    rl.close();
    throw err;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (args.seed) {
    const env = { ...process.env, ...readEnvFile(envPath) };
    try {
      await seedDatabase(env);
      console.log('\n✅ Setup complete.\n');
      printDone({
        siteUrl: firstReal(env, SITE_KEYS) || env.SITE_URL || 'http://localhost:4321',
        basePath: env.BLOG_BASE_PATH || '',
        addon: Boolean(env.BLOG_BASE_PATH && env.BLOG_BASE_PATH !== '/'),
        seeded: true,
      });
    } catch (err) {
      console.error(`\nSetup failed: ${err.message}\n`);
      process.exit(1);
    }
    return;
  }
  await wizard(args);
}

main().catch((err) => {
  console.error(`\nSetup failed: ${err.message || err}\n`);
  process.exit(1);
});
