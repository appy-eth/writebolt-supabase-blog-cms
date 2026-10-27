/**
 * Find a Postgres connection string for a Supabase project.
 * The service role key can read and write rows. Creating tables needs Postgres.
 */

const DB_URL_KEYS = [
  'SUPABASE_DB_URL',
  'DIRECT_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL',
];

function isPlaceholder(value) {
  if (!value || !String(value).trim()) return true;
  const text = String(value).trim().toLowerCase();
  return text.includes('your-') || text.includes('your_') || text.includes('changeme') || text.includes('paste-') || text === 'xxx';
}

export function projectRef(supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).hostname;
    if (!host.endsWith('.supabase.co')) return '';
    const ref = host.slice(0, -'.supabase.co'.length);
    if (!ref || ref.includes('.')) return '';
    return ref;
  } catch {
    return '';
  }
}

export function directDatabaseUrl(supabaseUrl, password) {
  const ref = projectRef(supabaseUrl);
  if (!ref || !password) return '';
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

export function rewriteToDirect(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    return '';
  }
  if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(url.hostname)) return connectionString;
  const user = decodeURIComponent(url.username || '');
  if (!user.startsWith('postgres.')) return '';
  const ref = user.slice('postgres.'.length);
  const password = decodeURIComponent(url.password || '');
  if (!ref || !password) return '';
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function rank(connectionString) {
  if (/^postgresql:\/\/postgres:[^@]+@db\.[a-z0-9]+\.supabase\.co/i.test(connectionString)) return 0;
  if (/:6543\b/.test(connectionString)) return 2;
  return 1;
}

export function connectionCandidates(env, { supabaseUrl = '', password = '', explicitUrl = '' } = {}) {
  const fromEnv = [];
  for (const key of DB_URL_KEYS) {
    const value = env?.[key];
    if (value && !isPlaceholder(value)) fromEnv.push(String(value).trim());
  }
  const ordered = [];
  const seen = new Set();
  const push = (value) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    ordered.push(value);
  };

  if (explicitUrl && !isPlaceholder(explicitUrl)) push(explicitUrl.trim());
  for (const value of fromEnv.filter((item) => rank(item) < 2)) push(value);
  for (const value of [explicitUrl, ...fromEnv]) {
    const direct = value ? rewriteToDirect(value) : '';
    if (direct && direct !== value) push(direct);
  }
  if (password && supabaseUrl) push(directDatabaseUrl(supabaseUrl, password));
  for (const value of fromEnv.filter((item) => rank(item) >= 2)) push(value);
  return ordered;
}

export function databaseHost(connectionString) {
  try {
    return new URL(connectionString).host;
  } catch {
    return 'database';
  }
}

export function redactSecrets(text, secrets) {
  let out = String(text || '');
  const values = [...secrets].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const secret of values) {
    if (secret.length < 4) continue;
    out = out.split(secret).join('***');
  }
  return out;
}
