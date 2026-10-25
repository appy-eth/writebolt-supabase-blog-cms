#!/usr/bin/env node

/**
 * Writebolt Blog setup wizard.
 *
 *   npm run setup
 *     Standalone: asks for the Supabase project, then the admin username and password.
 *   npm run setup -- --addon --host /path/to/existing-site
 *     Add-on: copies Supabase from the existing Astro site, then asks for the admin username and password.
 *     The blog runs inside that site. This does not start a second server.
 *   npm run setup -- --seed
 *     Seeds again using the .env already written. No questions.
 *
 * Newsletter is not part of setup. Turn it on later in Admin → Settings.
 */

import { createClient } from '@supabase/supabase-js';
import { copyFileSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import readline from 'readline';

const root = process.cwd();
const scriptDir = dirname(fileURLToPath(import.meta.url));
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
  }
  return args;
}

function printHelp() {
  console.log(`
Writebolt Blog — setup wizard

  npm run setup
      Standalone blog. Asks for the Supabase project and an admin username and password.

  npm run setup -- --addon --host /path/to/existing-site --site-url https://example.com --site-name "Example"
      Add-on blog on an Astro site. Copies Supabase from that site. The blog runs in the site's own server.

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

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(String(value || ''));
}

function detectSiteUrl(hostDir, envVars) {
  const explicit = firstReal(envVars, SITE_KEYS);
  if (explicit && !isLocalUrl(explicit)) return explicit;
  for (const name of ['astro.config.mjs', 'astro.config.ts', 'astro.config.js']) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    const site = source.match(/\bsite\s*:\s*['"](https?:\/\/[^'"]+)['"]/);
    if (site) return site[1].replace(/\/$/, '');
  }
  for (const name of ['src/lib/site.ts', 'src/lib/site.js', 'src/consts.ts']) {
    const file = join(hostDir, name);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    const named = source.match(/\bSITE_URL\s*=\s*['"](https?:\/\/[^'"]+)['"]/);
    if (named) return named[1].replace(/\/$/, '');
  }
  if (explicit) return explicit;
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

function hostEnvPath(hostDir) {
  for (const name of ['.env.local', '.env']) {
    const file = join(hostDir, name);
    if (existsSync(file)) return file;
  }
  return join(hostDir, '.env');
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

function printDone({ siteUrl, basePath, addon, seeded, username, password, generatedPassword }) {
  const urls = adminUrls(siteUrl, basePath);
  console.log('\n── Next steps ─────────────────────────────────────────');
  if (!seeded) {
    console.log('The database is not ready yet. In the Supabase SQL editor, run:');
    console.log('  supabase/001_initial_schema.sql');
    console.log('Then seed again with:  npm run setup -- --seed');
  }
  console.log(`Admin: ${urls.login}`);
  console.log(`First article: ${urls.article}`);
  if (generatedPassword) {
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('Save that password. It is in the site .env as WRITEBOLT_ADMIN_PASSWORD.');
  } else {
    console.log('Sign in with the username and password you just set.');
  }
  if (addon) {
    console.log('The blog runs inside the existing Astro site. Do not start a second server.');
    console.log('In that site\'s astro.config.mjs:');
    console.log('  import { writebolt } from \'./writebolt-astro/integration/astro.mjs\';');
    console.log('  integrations: [writebolt({ layout: \'./src/layouts/Layout.astro\' })]');
    console.log('Then run npm run dev in the existing site. /blog is part of that server.');
  } else {
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
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const siteName = options.siteName || env.WRITEBOLT_SITE_NAME || '';
  const siteDescription = options.siteDescription || env.WRITEBOLT_SITE_DESCRIPTION || (siteName ? siteName : '');
  const basePath = String(env.BLOG_BASE_PATH || '').trim();
  const addon = options.addon ?? (basePath.length > 0 && basePath !== '/');
  const supabase = createClient(url, key);
  console.log('⚡ Writebolt Blog Setup\n');

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
    if (addon && row.layout_mode === 'standalone') patch.layout_mode = 'embedded';
    if (siteName && (!row.site_name || row.site_name === 'My Blog')) patch.site_name = siteName;
    if (siteDescription && stockDescription(row.site_description)) patch.site_description = siteDescription;
    if (addon && row.image_storage_provider === 'local' && (!row.site_name || row.site_name === 'My Blog')) {
      patch.image_storage_provider = 'supabase';
    }
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

function writeHostSecrets(hostDir, secrets) {
  const file = hostEnvPath(hostDir);
  const current = existsSync(file) ? readFileSync(file, 'utf8') : '# Writebolt blog\n';
  const existing = parseEnv(current);
  const updates = {
    WRITEBOLT_ADMIN_USERNAME: secrets.username,
    WRITEBOLT_ADMIN_PASSWORD: secrets.password,
  };
  if (!firstReal(existing, ['SETTINGS_ENCRYPTION_KEY']) && secrets.encryption) {
    updates.SETTINGS_ENCRYPTION_KEY = secrets.encryption;
  }
  if (!firstReal(existing, SERVICE_KEYS) && secrets.service) {
    updates.SUPABASE_SERVICE_ROLE_KEY = secrets.service;
  }
  if (!firstReal(existing, URL_KEYS) && secrets.url) {
    updates.PUBLIC_SUPABASE_URL = secrets.url;
    updates.PUBLIC_SUPABASE_ANON_KEY = secrets.anon;
  }
  writeFileSync(file, upsertEnv(current, updates));
  console.log(`  ✓ Wrote the blog admin login to ${file}`);
}

function finishHost(hostDir, siteUrl) {
  const schema = installSchema(hostDir);
  if (schema) console.log(`  ✓ Copied the blog schema to ${schema}`);
  if (ensureRobots(hostDir, siteUrl)) console.log('  ✓ Added the blog news sitemap to public/robots.txt');
}

async function resolveSupabase(rl, { addon, host, existing, interactive, serviceRole }) {
  const own = {
    url: firstReal(existing, ['SUPABASE_URL']),
    anon: firstReal(existing, ['SUPABASE_ANON_KEY']),
    service: firstReal(existing, ['SUPABASE_SERVICE_ROLE_KEY']),
  };
  if (own.url && own.anon && own.service && !addon) return own;

  if (!addon) {
    if (!interactive) {
      throw new Error('Standalone setup needs a terminal, or run again after SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are in .env.');
    }
    return collectSupabase(rl);
  }

  let hostDir = host;
  if (!hostDir && interactive) {
    hostDir = await question(rl, 'Path to the existing site (the folder that has its .env): ');
  }
  if (!hostDir || !existsSync(resolve(hostDir))) {
    if (!interactive) throw new Error('Pass --host with the path to the Astro site.');
    console.log('\nCould not find that site folder. Enter the Supabase project for this blog.\n');
    return collectSupabase(rl);
  }

  const dir = resolve(hostDir);
  const loaded = loadHostEnv(dir);
  const siteUrl = detectSiteUrl(dir, loaded.vars);
  const found = {
    url: firstReal(loaded.vars, URL_KEYS),
    anon: firstReal(loaded.vars, ANON_KEYS),
    service: serviceRole || firstReal(loaded.vars, SERVICE_KEYS),
    siteUrl,
    siteName: detectSiteName(dir, loaded.vars, siteUrl),
    hostDir: dir,
  };

  if (found.url && found.anon && found.service) {
    const from = loaded.files[0] || loaded.dir;
    console.log('Using the Supabase project already configured on the existing site.');
    console.log(`  ${found.url}`);
    console.log(`  from ${from}\n`);
    if (!interactive) return found;
    const useExisting = (await question(rl, 'Press Enter to use this project, or n to enter a different one: ')).toLowerCase();
    if (useExisting === 'n' || useExisting === 'no') {
      const typed = await collectSupabase(rl);
      return { ...found, ...typed };
    }
    return found;
  }

  if (found.url && found.anon && !found.service) {
    console.log('Found the Supabase URL and anon key on this site.');
    console.log(`${found.url}`);
    console.log('The service role key is still needed so the blog admin can save articles.\n');
    if (!interactive) {
      throw new Error('Add SUPABASE_SERVICE_ROLE_KEY to the site .env, or re-run with --service-role. Do not point this at a different app.');
    }
    found.service = await askRequired(rl, 'Supabase service role key: ', true);
    return found;
  }

  if (!interactive) {
    throw new Error('This site does not have a Supabase URL and anon key in its .env.');
  }
  console.log('This site does not already have a Supabase URL and API keys.');
  console.log('The blog stores its articles in Supabase, so those values are needed once.\n');
  const typed = await collectSupabase(rl);
  return { ...found, ...typed };
}

async function wizard(args) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const existing = readEnvFile(envPath);
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  console.log('\n⚡ Writebolt Blog — setup wizard\n');

  const close = () => {
    if (rl) rl.close();
  };

  try {
    const addon = args.addon || (existing.BLOG_BASE_PATH && existing.BLOG_BASE_PATH !== '/' && existing.BLOG_BASE_PATH !== '');
    const hasLogin = firstReal(existing, ['ADMIN_PASSWORD', 'WRITEBOLT_ADMIN_PASSWORD']);
    if (existsSync(envPath) && firstReal(existing, ['SUPABASE_URL']) && hasLogin) {
      let overwrite = false;
      if (interactive && !args.siteName && !args.siteUrl) {
        overwrite = ['y', 'yes'].includes((await question(rl, '.env already exists. Set it up again? [y/N]: ')).toLowerCase());
      }
      if (!overwrite) {
        close();
        console.log('Keeping the current .env. Seeding with those values.\n');
        const siteUrl = args.siteUrl || firstReal(existing, SITE_KEYS) || 'http://localhost:4321';
        if (addon && args.host && existsSync(resolve(args.host))) finishHost(resolve(args.host), siteUrl);
        let seeded = true;
        try {
          await seedDatabase(existing, {
            addon,
            siteName: args.siteName || existing.WRITEBOLT_SITE_NAME || '',
            siteDescription: args.siteDescription || existing.WRITEBOLT_SITE_DESCRIPTION || '',
          });
          console.log('\n✅ Setup complete.\n');
        } catch (err) {
          seeded = false;
          console.warn(`\n⚠️  Seed failed: ${err.message}\n`);
        }
        printDone({
          siteUrl,
          basePath: existing.BLOG_BASE_PATH || (addon ? '/blog' : ''),
          addon,
          seeded,
        });
        return;
      }
    }

    if (addon) {
      console.log('Add-on install. Articles will be served at /blog on the existing Astro site.');
      console.log('Newsletter is turned on later in Admin → Settings.\n');
    } else {
      console.log('Standalone install. Articles will be served at /{slug}.');
      console.log('Newsletter is turned on later in Admin → Settings.\n');
    }

    const supabase = await resolveSupabase(rl, {
      addon,
      host: args.host,
      existing,
      interactive,
      serviceRole: args.serviceRole,
    });
    const detectedUrl = args.siteUrl || supabase.siteUrl || firstReal(existing, SITE_KEYS) || '';
    let siteUrl = detectedUrl.replace(/\/$/, '');
    if (interactive) {
      siteUrl = await askHttp(rl, 'Site URL', siteUrl || 'http://localhost:4321');
    } else if (!siteUrl || (addon && isLocalUrl(siteUrl))) {
      throw new Error('Could not find the public site URL. Re-run with --site-url https://yoursite.com');
    }

    const detectedName = args.siteName || supabase.siteName || detectSiteName(supabase.hostDir || '', {}, siteUrl);
    let siteName = detectedName;
    if (interactive) {
      const typed = await question(rl, `Site name${detectedName ? ` [${detectedName}]` : ''}: `);
      siteName = typed || detectedName;
    }
    if (addon && !siteName) siteName = 'My Blog';

    const username = args.adminUser || (interactive ? (await question(rl, 'Admin username [admin]: ')) : '') || 'admin';
    let password = args.password;
    let generatedPassword = false;
    if (!password) {
      if (interactive) password = await askRequired(rl, 'Admin password: ');
      else {
        password = randomBytes(9).toString('base64url');
        generatedPassword = true;
      }
    }
    const siteDescription = args.siteDescription || (siteName && siteName !== 'My Blog' ? siteName : '');
    close();

    const updates = {
      SUPABASE_URL: supabase.url,
      SUPABASE_ANON_KEY: supabase.anon,
      SUPABASE_SERVICE_ROLE_KEY: supabase.service,
      ADMIN_USERNAME: username,
      ADMIN_PASSWORD: password,
      WRITEBOLT_ADMIN_USERNAME: username,
      WRITEBOLT_ADMIN_PASSWORD: password,
      WRITEBOLT_SITE_NAME: siteName,
      SITE_URL: siteUrl,
      BLOG_BASE_PATH: addon ? '/blog' : '',
    };
    if (siteDescription) updates.WRITEBOLT_SITE_DESCRIPTION = siteDescription;

    console.log('');
    writeEnv(updates);
    const written = readEnvFile(envPath);
    if (addon && supabase.hostDir) {
      writeHostSecrets(supabase.hostDir, {
        username,
        password,
        service: supabase.service,
        url: supabase.url,
        anon: supabase.anon,
        encryption: written.SETTINGS_ENCRYPTION_KEY,
      });
      finishHost(supabase.hostDir, siteUrl);
    }

    let seeded = true;
    try {
      await seedDatabase(written, { addon, siteName, siteDescription });
      console.log('\n✅ Setup complete.\n');
    } catch (err) {
      seeded = false;
      console.warn(`\n⚠️  .env is saved. Seed failed: ${err.message}\n`);
    }
    printDone({
      siteUrl,
      basePath: updates.BLOG_BASE_PATH,
      addon,
      seeded,
      username,
      password,
      generatedPassword,
    });
  } catch (err) {
    close();
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
