#!/usr/bin/env node

/**
 * Writebolt Blog setup wizard.
 *
 *   npm run setup
 *     Inside an Astro site (writebolt-astro/ is a subfolder): uses that site's env,
 *     creates the Supabase tables, and asks for the blog title, admin username, and password.
 *   npm run setup -- --standalone
 *     This folder is the whole site. Writes writebolt-astro/.env.
 *   npm run setup -- --seed
 *     Seeds again. No questions.
 *
 * Newsletter is not part of setup. Turn it on later in Admin → Settings.
 */

import { createClient } from '@supabase/supabase-js';
import { copyFileSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { basename, dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import readline from 'readline';
import { connectionCandidates } from './db-url.mjs';
import { applyFirstWorking, blogTablesReady, waitForBlogTables } from './schema.mjs';
import {
  configHasAdapter,
  ensureWriteboltIntegration,
  findAstroConfig,
  findLayout,
  hasDefaultSlot,
  integrationImportPath,
} from './host-config.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(scriptDir);
const envPath = join(root, '.env');

const URL_KEYS = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'];
const ANON_KEYS = ['SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'];
const SERVICE_KEYS = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
const SITE_KEYS = ['SITE_URL', 'NEXT_PUBLIC_SITE_URL', 'PUBLIC_SITE_URL', 'PUBLIC_MARKETING_URL'];
const APP_URL_KEYS = ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_APP_ORIGIN', 'APP_BASE_URL', 'PUBLIC_APP_URL'];
const NAME_KEYS = ['WRITEBOLT_SITE_NAME', 'SITE_NAME', 'PUBLIC_SITE_NAME', 'NEXT_PUBLIC_SITE_NAME'];
const HOST_ENV_FILES = ['.env', '.env.development', '.env.local', '.env.development.local'];

function parseArgs(argv) {
  const args = {
    seed: false,
    addon: false,
    help: false,
    host: '',
    siteUrl: '',
    siteName: '',
    siteDescription: '',
    adminUser: '',
    password: '',
    serviceRole: '',
    dbPassword: '',
    dbUrl: '',
    standalone: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--seed') args.seed = true;
    else if (arg === '--addon') args.addon = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--host') args.host = argv[++i] || '';
    else if (arg.startsWith('--host=')) args.host = arg.slice('--host='.length);
    else if (arg === '--site-url') args.siteUrl = argv[++i] || '';
    else if (arg.startsWith('--site-url=')) args.siteUrl = arg.slice('--site-url='.length);
    else if (arg === '--site-name') args.siteName = argv[++i] || '';
    else if (arg.startsWith('--site-name=')) args.siteName = arg.slice('--site-name='.length);
    else if (arg === '--site-description') args.siteDescription = argv[++i] || '';
    else if (arg.startsWith('--site-description=')) args.siteDescription = arg.slice('--site-description='.length);
    else if (arg === '--admin-user') args.adminUser = argv[++i] || '';
    else if (arg.startsWith('--admin-user=')) args.adminUser = arg.slice('--admin-user='.length);
    else if (arg === '--admin-password') args.password = argv[++i] || '';
    else if (arg.startsWith('--admin-password=')) args.password = arg.slice('--admin-password='.length);
    else if (arg === '--service-role') args.serviceRole = argv[++i] || '';
    else if (arg.startsWith('--service-role=')) args.serviceRole = arg.slice('--service-role='.length);
    else if (arg === '--db-password') args.dbPassword = argv[++i] || '';
    else if (arg.startsWith('--db-password=')) args.dbPassword = arg.slice('--db-password='.length);
    else if (arg === '--db-url') args.dbUrl = argv[++i] || '';
    else if (arg.startsWith('--db-url=')) args.dbUrl = arg.slice('--db-url='.length);
    else if (arg === '--standalone') args.standalone = true;
  }
  return args;
}

function printHelp() {
  console.log(`
Writebolt Blog — setup wizard

  npm run setup
      Add the blog to the Astro site that contains this folder. Uses that site's env.
      Asks for the blog title, admin username, and admin password, then creates the tables.

  npm run setup -- --standalone
      This folder is the whole website. Writes .env here.

  npm run setup -- --seed
      Seed the database again. Does not ask questions.

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

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(String(value || ''));
}

function detectSiteUrl(hostDir, envVars, { allowAppUrl = false } = {}) {
  const explicit = firstReal(envVars, SITE_KEYS);
  if (explicit && !isLocalUrl(explicit)) return explicit;
  if (!hostDir) return allowAppUrl ? nonLocalAppUrl(envVars) : '';
  for (const name of ['astro.config.mjs', 'astro.config.ts', 'astro.config.js']) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    const site = source.match(/\bsite\s*:\s*['"](https?:\/\/[^'"]+)['"]/);
    if (site && !isLocalUrl(site[1])) return site[1].replace(/\/$/, '');
  }
  for (const name of ['src/lib/site.ts', 'src/lib/site.js', 'src/consts.ts']) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    const named = source.match(/\bSITE_URL\s*=\s*['"](https?:\/\/[^'"]+)['"]/);
    if (named && !isLocalUrl(named[1])) return named[1].replace(/\/$/, '');
  }
  if (allowAppUrl) return nonLocalAppUrl(envVars);
  return '';
}

function nonLocalAppUrl(envVars) {
  const appUrl = firstReal(envVars, APP_URL_KEYS);
  return appUrl && !isLocalUrl(appUrl) ? appUrl : '';
}

function detectSiteName(hostDir, envVars, siteUrl) {
  const named = firstReal(envVars, NAME_KEYS);
  if (named) return named;
  for (const name of ['src/lib/site.ts', 'src/lib/site.js', 'src/consts.ts']) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    const brand = source.match(/\b(?:BRAND|SITE_NAME|siteName)\s*=\s*['"]([^'"]+)['"]/);
    if (brand) return brand[1];
  }
  try {
    const pkg = JSON.parse(readFileSync(join(hostDir, 'package.json'), 'utf8'));
    if (pkg.name && !/astro|website|app/i.test(pkg.name)) return String(pkg.name);
  } catch {
    /* no package.json */
  }
  if (!siteUrl) return '';
  const host = siteUrl.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  const label = host.split('.')[0] || '';
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : '';
}

function stockDescription(value) {
  const text = String(value || '');
  return !text || /powered by writebolt/i.test(text) || text.startsWith('A short tagline');
}

function installSchema(hostDir) {
  const migrations = join(hostDir, 'supabase', 'migrations');
  if (!existsSync(migrations)) return '';
  const existing = readdirSync(migrations).filter((name) => name.endsWith('.sql'));
  for (const name of existing) {
    const source = readFileSync(join(migrations, name), 'utf8');
    if (source.includes('site_settings') && source.includes('content_markdown')) return '';
  }
  const dest = join(migrations, '001_writebolt_blog_schema.sql');
  copyFileSync(join(scriptDir, '../supabase/001_initial_schema.sql'), dest);
  return dest;
}

function ensureRobots(hostDir, siteUrl) {
  const file = join(hostDir, 'public', 'robots.txt');
  if (!existsSync(file) || !siteUrl || isLocalUrl(siteUrl)) return false;
  const origin = siteUrl.replace(/\/$/, '');
  const news = `${origin}/blog/news-sitemap.xml`;
  let text = readFileSync(file, 'utf8');
  if (text.includes(news)) return false;
  if (!text.includes('User-agent: Googlebot-News')) {
    text = `${text.replace(/\s*$/, '')}\n\n# Google News (Writebolt blog)\nUser-agent: Googlebot-News\nAllow: /blog/\n`;
  }
  if (!text.includes(`${origin}/blog/sitemap.xml`)) {
    text = `${text.replace(/\s*$/, '')}\nSitemap: ${origin}/blog/sitemap.xml\n`;
  }
  text = `${text.replace(/\s*$/, '')}\nSitemap: ${news}\n`;
  writeFileSync(file, text);
  return true;
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

function printDone({ siteUrl, basePath, addon, seeded, username, password, generatedPassword, reused, envFile, integrationNote }) {
  const urls = adminUrls(siteUrl, basePath);
  console.log('\n── Next steps ─────────────────────────────────────────');
  if (!seeded) {
    console.log('The blog name was not saved. Run npm run setup -- --seed once the database is reachable.');
  }
  if (generatedPassword) {
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } else if (!reused) {
    console.log('Sign in with the username and password you just set.');
  }
  if (addon) {
    console.log(`Blog login is in ${envFile}.`);
    console.log('That is the site env. There is no separate blog env file.');
    if (integrationNote) console.log(integrationNote);
    console.log('In the site folder, run npm run dev, then open /blog and /blog/admin/login.');
    if (siteUrl && !isLocalUrl(siteUrl)) console.log(`Public admin: ${urls.login}`);
  } else {
    console.log(`Admin: ${urls.login}`);
    console.log('Start the blog with:  npm run dev');
  }
  console.log('────────────────────────────────────────────────────────\n');
}

async function ensureBucket(supabase) {
  const { error } = await supabase.storage.createBucket('blog-images', { public: true });
  if (!error) {
    console.log('  ✓ Storage bucket blog-images');
    return;
  }
  if (/already exists|duplicate/i.test(error.message || '')) return;
  console.warn(`  · Could not create the blog-images bucket: ${error.message}`);
}

async function seedDatabase(env, options = {}) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || isPlaceholder(url) || isPlaceholder(key)) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const siteName = options.siteName || env.WRITEBOLT_SITE_NAME || '';
  const siteDescription = options.siteDescription || env.WRITEBOLT_SITE_DESCRIPTION || (siteName ? siteName : '');
  const basePath = String(env.BLOG_BASE_PATH || '').trim();
  const addon = options.addon ?? (basePath.length > 0 && basePath !== '/');
  const supabase = createClient(url, key);

  const author = await supabase.from('authors').select('id, name').eq('slug', 'admin').maybeSingle();
  if (author.error) throw new Error(author.error.message);
  if (!author.data) {
    const inserted = await supabase.from('authors').insert({
      name: siteName || 'Admin',
      slug: 'admin',
      is_default: true,
      role: 'admin',
      is_active: true,
    });
    if (inserted.error) throw new Error(inserted.error.message);
    console.log('  ✓ Default author created');
  } else if (siteName && author.data.name === 'Admin') {
    const updated = await supabase.from('authors').update({ name: siteName }).eq('id', author.data.id);
    if (updated.error) throw new Error(updated.error.message);
    console.log(`  ✓ Default author renamed to ${siteName}`);
  } else {
    console.log('  · Default author exists');
  }

  const settings = await supabase
    .from('site_settings')
    .select('id, site_name, site_description, layout_mode, image_storage_provider')
    .limit(1)
    .maybeSingle();
  if (settings.error) throw new Error(settings.error.message);
  if (!settings.data) {
    const inserted = await supabase.from('site_settings').insert({
      site_name: siteName || 'My Blog',
      site_description: siteDescription || 'A blog powered by Writebolt',
      ...(addon ? { layout_mode: 'embedded', image_storage_provider: 'supabase' } : {}),
    });
    if (inserted.error) throw new Error(inserted.error.message);
    console.log(addon
      ? '  ✓ Site settings created (add-on: embedded layout, this site\'s header and footer)'
      : '  ✓ Site settings created');
    if (addon) await ensureBucket(supabase);
  } else {
    const row = settings.data;
    const patch = {};
    if (addon && row.layout_mode !== 'embedded') patch.layout_mode = 'embedded';
    if (siteName && (!row.site_name || row.site_name === 'My Blog')) patch.site_name = siteName;
    if (siteDescription && stockDescription(row.site_description)) patch.site_description = siteDescription;
    if (addon && row.image_storage_provider !== 'supabase') patch.image_storage_provider = 'supabase';
    if (Object.keys(patch).length) {
      const updated = await supabase.from('site_settings').update(patch).eq('id', row.id);
      if (updated.error) throw new Error(updated.error.message);
      console.log(`  ✓ Site settings updated (${Object.keys(patch).join(', ')})`);
      if (patch.image_storage_provider === 'supabase') await ensureBucket(supabase);
    } else {
      console.log('  · Site settings exist');
    }
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
  const body = upsertEnv(base, next);
  writeFileSync(envPath, body, 'utf8');
  console.log('  ✓ Wrote .env');
  return parseEnv(body);
}

function parentAstroHost() {
  const parent = resolve(root, '..');
  return findAstroConfig(parent) ? parent : '';
}

function envFileForSite(hostDir) {
  let found = '';
  for (const name of HOST_ENV_FILES) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    if (firstReal(readEnvFile(file), URL_KEYS)) found = file;
  }
  if (found) return found;
  if (existsSync(join(hostDir, '.env.local'))) return join(hostDir, '.env.local');
  if (existsSync(join(hostDir, '.env'))) return join(hostDir, '.env');
  return join(hostDir, '.env.local');
}

function isGitignored(dir, name) {
  const gitignore = join(dir, '.gitignore');
  if (!existsSync(gitignore)) return false;
  return readFileSync(gitignore, 'utf8').split(/\r?\n/).some((line) => {
    const pattern = line.trim();
    if (!pattern || pattern.startsWith('#')) return false;
    if (pattern === name) return true;
    if (!pattern.includes('*')) return false;
    const expression = `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`;
    return new RegExp(expression).test(name);
  });
}

function writeSiteEnv(file, updates) {
  const current = existsSync(file) ? readFileSync(file, 'utf8') : '# Writebolt blog\n';
  const existing = parseEnv(current);
  const next = { ...updates };
  if (existing.SETTINGS_ENCRYPTION_KEY || next.SETTINGS_ENCRYPTION_KEY) {
    if (existing.SETTINGS_ENCRYPTION_KEY) delete next.SETTINGS_ENCRYPTION_KEY;
  } else {
    next.SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString('hex');
    console.log('  ✓ Generated SETTINGS_ENCRYPTION_KEY');
  }
  const body = upsertEnv(current, next);
  writeFileSync(file, body);
  console.log(`  ✓ Saved the blog login in ${file}`);
  if (!isGitignored(dirname(file), basename(file))) {
    console.warn(`  · ${basename(file)} is not in .gitignore. Do not commit the admin password.`);
  }
  return parseEnv(body);
}

function siteUpdates({ addon, username, password, siteName, siteDescription, service, url, anon, dbUrl, siteUrl, envVars }) {
  const updates = {
    WRITEBOLT_ADMIN_USERNAME: username,
    WRITEBOLT_ADMIN_PASSWORD: password,
    WRITEBOLT_SITE_NAME: siteName,
  };
  if (siteDescription) updates.WRITEBOLT_SITE_DESCRIPTION = siteDescription;
  if (addon) updates.BLOG_BASE_PATH = '/blog';
  if (service && !firstReal(envVars, SERVICE_KEYS)) updates.SUPABASE_SERVICE_ROLE_KEY = service;
  if (url && !firstReal(envVars, URL_KEYS)) {
    updates.PUBLIC_SUPABASE_URL = url;
    updates.PUBLIC_SUPABASE_ANON_KEY = anon;
  }
  if (dbUrl && !connectionCandidates(envVars).length) updates.SUPABASE_DB_URL = dbUrl;
  if (siteUrl && !isLocalUrl(siteUrl) && !firstReal(envVars, SITE_KEYS)) updates.SITE_URL = siteUrl;
  return updates;
}

async function ensureDatabase(rl, { interactive, url, serviceKey, envVars, dbPassword, dbUrl }) {
  const before = await blogTablesReady(url, serviceKey);
  if (before.ready && !before.legacy) {
    console.log('  ✓ Blog tables are already in Supabase');
    return '';
  }
  console.log(before.legacy
    ? 'Updating blog tables from an older schema.'
    : 'Creating the blog tables in Supabase.');

  let password = dbPassword;
  let explicit = dbUrl;
  let askedUri = Boolean(explicit);
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidates = connectionCandidates(envVars, { supabaseUrl: url, password, explicitUrl: explicit });
    if (!candidates.length) {
      if (!interactive) {
        throw new Error('Creating tables needs the database password. Add DATABASE_URL or SUPABASE_DB_URL to the site env, or re-run with --db-password. The Supabase API keys cannot create tables.');
      }
      console.log('The Supabase URL and keys in this site\'s env can read and write rows. Creating tables needs the database password.');
      console.log('Supabase → Project Settings → Database → Database password.\n');
      password = await askRequired(rl, 'Database password: ');
      continue;
    }
    try {
      const used = await applyFirstWorking(candidates);
      const after = await waitForBlogTables(url, serviceKey);
      if (!after.ready || after.legacy) {
        throw new Error('Tables were created, but Supabase has not exposed them to the API yet. Run npm run setup again in a minute.');
      }
      console.log('  ✓ Blog tables are ready');
      return connectionCandidates(envVars).includes(used) ? '' : used;
    } catch (error) {
      if (error.code !== 'CONNECT_FAILED') throw error;
      if (!interactive || askedUri) {
        throw new Error(`${error.message}\n\nYou can also paste supabase/001_initial_schema.sql into the Supabase SQL editor, then run npm run setup -- --seed.`);
      }
      console.log(`\n${error.message}`);
      console.log('db.<project>.supabase.co is often IPv6-only. Paste the Session pooler URI from Supabase → Project Settings → Database (port 5432).\n');
      explicit = await askRequired(rl, 'Database URI: ');
      askedUri = true;
    }
  }
  throw new Error('Could not create the blog tables.');
}

async function resolveSupabase(rl, { addon, hostDir, interactive, serviceRole, legacy }) {
  const source = addon ? loadHostEnv(hostDir).vars : legacy;
  let url = firstReal(source, URL_KEYS) || firstReal(legacy, URL_KEYS);
  let anon = firstReal(source, ANON_KEYS) || firstReal(legacy, ANON_KEYS);
  let service = serviceRole || firstReal(source, SERVICE_KEYS) || firstReal(legacy, SERVICE_KEYS);
  if (addon && url) console.log(`Using Supabase from this site's env:\n  ${url}\n`);
  if (url && anon && service) return { url, anon, service };

  if (!interactive) {
    if (!url || !anon) {
      throw new Error(addon
        ? 'This site\'s env has no Supabase URL and anon key.'
        : 'Add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to .env, or run setup in a terminal.');
    }
    throw new Error('Add SUPABASE_SERVICE_ROLE_KEY to the site env, or re-run with --service-role.');
  }
  if (!url || !anon) {
    console.log(addon
      ? 'This site\'s env has no Supabase URL and anon key yet.\n'
      : 'Paste the project URL and API keys from Supabase → Project Settings → API.\n');
    if (!url) url = await askHttp(rl, 'Supabase URL');
    if (!anon) anon = await askRequired(rl, 'Supabase anon key: ', true);
  } else {
    console.log('The service role key is still needed so the blog admin can save articles.');
    console.log('Supabase → Project Settings → API → service_role.\n');
  }
  if (!service) service = await askRequired(rl, 'Supabase service role key: ', true);
  return { url, anon, service };
}

async function resolveSiteUrl(rl, { interactive, addon, args, hostDir, envVars }) {
  const detected = (args.siteUrl || detectSiteUrl(hostDir, envVars, { allowAppUrl: !addon }) || '').replace(/\/$/, '');
  if (detected && !(addon && isLocalUrl(detected))) return detected;
  if (interactive) {
    console.log('Canonical links, the sitemap, and RSS need the public site URL.\n');
    return askHttp(rl, 'Site URL');
  }
  if (!addon) return 'http://localhost:4321';
  throw new Error('Could not find the public site URL. Set site in astro.config, or re-run with --site-url https://yoursite.com');
}

async function askIdentity(rl, { interactive, args, detectedName, existingUser, existingPassword }) {
  const keepExisting = existingPassword && !args.password && !args.siteName && !args.adminUser;
  if (keepExisting && !interactive) {
    return {
      siteName: detectedName,
      username: existingUser || 'admin',
      password: existingPassword,
      generatedPassword: false,
      reused: true,
    };
  }
  if (keepExisting && interactive) {
    const again = (await question(rl, 'Blog admin is already in the site env. Set the title and password again? [y/N]: ')).toLowerCase();
    if (again !== 'y' && again !== 'yes') {
      return {
        siteName: detectedName,
        username: existingUser || 'admin',
        password: existingPassword,
        generatedPassword: false,
        reused: true,
      };
    }
  }

  let siteName = args.siteName || detectedName;
  if (interactive && !args.siteName) {
    const typed = await question(rl, `Blog title${siteName ? ` [${siteName}]` : ''}: `);
    siteName = typed || siteName;
  }
  if (!siteName) {
    if (!interactive) throw new Error('Pass --site-name "Your Site".');
    siteName = await askRequired(rl, 'Blog title: ');
  }
  const username = args.adminUser
    || (interactive ? ((await question(rl, 'Admin username [admin]: ')) || 'admin') : (existingUser || 'admin'));
  let password = args.password;
  let generatedPassword = false;
  if (!password) {
    if (interactive) password = await askRequired(rl, 'Admin password: ');
    else {
      password = randomBytes(9).toString('base64url');
      generatedPassword = true;
    }
  }
  return { siteName, username, password, generatedPassword, reused: false };
}

function wireIntegration(hostDir) {
  const configPath = findAstroConfig(hostDir);
  const notes = [];
  if (!configPath) {
    notes.push('No astro.config was found. Add writebolt() to the site config.');
    return notes.join('\n');
  }
  const layout = findLayout(hostDir);
  const layoutPath = layout ? `./${layout}` : './src/layouts/Layout.astro';
  const source = readFileSync(configPath, 'utf8');
  const result = ensureWriteboltIntegration(source, {
    importPath: integrationImportPath(root),
    layoutPath,
  });
  if (result.manual) {
    notes.push(`Add this to ${basename(configPath)}:`);
    notes.push(`  ${result.importLine}`);
    notes.push(`  integrations: [${result.call}]`);
  } else if (result.changed) {
    writeFileSync(configPath, result.source);
    console.log(`  ✓ Added writebolt() to ${basename(configPath)}`);
  } else {
    console.log('  ✓ writebolt() is already in the Astro config');
  }
  if (!layout) notes.push('No layout was found under src/layouts. Pass the site layout to writebolt({ layout }).');
  else if (!hasDefaultSlot(readFileSync(join(hostDir, layout), 'utf8'))) {
    notes.push(`${layout} needs a <slot /> where the page body goes, or the blog content will not show.`);
  }
  if (!configHasAdapter(result.source)) {
    notes.push('This site has no server adapter. /blog renders on each request. On Vercel, run npx astro add vercel in the site folder.');
  }
  const clash = ['src/pages/blog.astro', 'src/pages/blog'].find((entry) => existsSync(join(hostDir, entry)));
  if (clash) notes.push(`Remove ${clash}. It would override /blog.`);
  return notes.join('\n');
}

function seedInput(env, addon) {
  return {
    ...env,
    SUPABASE_URL: firstReal(env, URL_KEYS),
    SUPABASE_SERVICE_ROLE_KEY: firstReal(env, SERVICE_KEYS),
    BLOG_BASE_PATH: addon ? '/blog' : String(env.BLOG_BASE_PATH || ''),
  };
}

function finishHost(hostDir, siteUrl) {
  const schema = installSchema(hostDir);
  if (schema) console.log(`  ✓ Copied the blog schema to ${schema}`);
  if (ensureRobots(hostDir, siteUrl)) console.log('  ✓ Added the blog news sitemap to public/robots.txt');
}

async function wizard(args) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const legacy = readEnvFile(envPath);
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  const close = () => {
    if (rl) rl.close();
  };
  console.log('\n⚡ Writebolt Blog — setup wizard\n');

  try {
    const hostCandidate = args.standalone ? '' : (args.host ? resolve(args.host) : parentAstroHost());
    if (args.host && !findAstroConfig(hostCandidate)) {
      throw new Error(`No astro.config in ${hostCandidate}`);
    }
    if (args.addon && !hostCandidate) throw new Error('Pass --host with the path to the Astro site.');
    const addon = Boolean(hostCandidate);
    const hostDir = hostCandidate;
    const envVars = addon ? loadHostEnv(hostDir).vars : legacy;
    const envFile = addon ? envFileForSite(hostDir) : envPath;

    if (addon) {
      console.log(`Adding the blog to ${hostDir}`);
      console.log('Articles will be served at /blog on this site\'s dev server.');
      if (existsSync(envPath)) {
        console.log('An old writebolt-astro/.env is still here. The site env is what the blog uses. You can delete that file.');
      }
      console.log('');
    } else {
      console.log('Standalone blog. Articles will be served at /{slug}.\n');
    }

    const supabase = await resolveSupabase(rl, {
      addon,
      hostDir,
      interactive,
      serviceRole: args.serviceRole,
      legacy,
    });
    const dbUrlToSave = await ensureDatabase(rl, {
      interactive,
      url: supabase.url,
      serviceKey: supabase.service,
      envVars: { ...legacy, ...envVars },
      dbPassword: args.dbPassword,
      dbUrl: args.dbUrl,
    });
    const siteUrl = await resolveSiteUrl(rl, { interactive, addon, args, hostDir, envVars });
    const detectedName = args.siteName || detectSiteName(hostDir || root, { ...envVars, ...legacy }, siteUrl);
    const identity = await askIdentity(rl, {
      interactive,
      args,
      detectedName,
      existingUser: firstReal(envVars, ['WRITEBOLT_ADMIN_USERNAME', 'ADMIN_USERNAME']) || firstReal(legacy, ['WRITEBOLT_ADMIN_USERNAME', 'ADMIN_USERNAME']),
      existingPassword: firstReal(envVars, ['WRITEBOLT_ADMIN_PASSWORD', 'ADMIN_PASSWORD']) || firstReal(legacy, ['WRITEBOLT_ADMIN_PASSWORD', 'ADMIN_PASSWORD']),
    });
    const siteDescription = args.siteDescription || identity.siteName;
    close();

    const updates = siteUpdates({
      addon,
      username: identity.username,
      password: identity.password,
      siteName: identity.siteName,
      siteDescription,
      service: supabase.service,
      url: supabase.url,
      anon: supabase.anon,
      dbUrl: dbUrlToSave,
      siteUrl,
      envVars,
    });
    if (!addon) {
      Object.assign(updates, {
        SUPABASE_URL: supabase.url,
        SUPABASE_ANON_KEY: supabase.anon,
        SUPABASE_SERVICE_ROLE_KEY: supabase.service,
        ADMIN_USERNAME: identity.username,
        ADMIN_PASSWORD: identity.password,
        SITE_URL: siteUrl,
        BLOG_BASE_PATH: '',
      });
    }

    console.log('');
    const written = addon ? writeSiteEnv(envFile, updates) : writeEnv(updates);
    if (addon) finishHost(hostDir, siteUrl);
    const integrationNote = addon ? wireIntegration(hostDir) : '';

    let seeded = true;
    try {
      await seedDatabase(seedInput({ ...envVars, ...written, ...updates }, addon), {
        addon,
        siteName: identity.siteName,
        siteDescription,
      });
      console.log('\n✅ Setup complete.\n');
    } catch (err) {
      seeded = false;
      console.warn(`\n⚠️  The env is saved. Seed failed: ${err.message}\n`);
    }
    printDone({
      siteUrl,
      basePath: addon ? '/blog' : '',
      addon,
      seeded,
      username: identity.username,
      password: identity.password,
      generatedPassword: identity.generatedPassword,
      reused: identity.reused,
      envFile,
      integrationNote,
    });
  } catch (err) {
    close();
    throw err;
  }
}

async function seedAgain(args) {
  const hostDir = args.standalone ? '' : (args.host ? resolve(args.host) : parentAstroHost());
  const addon = Boolean(hostDir);
  const env = {
    ...process.env,
    ...readEnvFile(envPath),
    ...(addon ? loadHostEnv(hostDir).vars : {}),
  };
  const url = firstReal(env, URL_KEYS);
  const service = firstReal(env, SERVICE_KEYS);
  if (!url || !service) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the site env.');
  const ready = await blogTablesReady(url, service);
  if (!ready.ready || ready.legacy) {
    const candidates = connectionCandidates(env, {
      supabaseUrl: url,
      password: args.dbPassword,
      explicitUrl: args.dbUrl,
    });
    if (!candidates.length) {
      throw new Error('Creating tables needs the database password. Add DATABASE_URL or SUPABASE_DB_URL to the site env, or re-run with --db-password.');
    }
    await applyFirstWorking(candidates);
    await waitForBlogTables(url, service);
  }
  await seedDatabase(seedInput(env, addon), {
    addon,
    siteName: args.siteName || env.WRITEBOLT_SITE_NAME || '',
    siteDescription: args.siteDescription || env.WRITEBOLT_SITE_DESCRIPTION || '',
  });
  console.log('\n✅ Setup complete.\n');
  printDone({
    siteUrl: args.siteUrl || detectSiteUrl(hostDir, env, { allowAppUrl: !addon }) || 'http://localhost:4321',
    basePath: addon ? '/blog' : '',
    addon,
    seeded: true,
    reused: true,
    envFile: addon ? envFileForSite(hostDir) : envPath,
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (args.seed) {
    await seedAgain(args);
    return;
  }
  await wizard(args);
}

main().catch((err) => {
  console.error(`\nSetup failed: ${err.message || err}\n`);
  process.exit(1);
});
