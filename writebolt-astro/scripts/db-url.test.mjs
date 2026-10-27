import assert from 'node:assert/strict';
import test from 'node:test';
import {
  connectionCandidates,
  directDatabaseUrl,
  projectRef,
  redactSecrets,
  rewriteToDirect,
} from './db-url.mjs';

test('projectRef reads a Supabase hostname', () => {
  assert.equal(projectRef('https://abccompany.supabase.co'), 'abccompany');
  assert.equal(projectRef('https://example.com'), '');
  assert.equal(projectRef('not a url'), '');
});

test('directDatabaseUrl encodes the password', () => {
  assert.equal(
    directDatabaseUrl('https://abccompany.supabase.co', 'p@ss word'),
    'postgresql://postgres:p%40ss%20word@db.abccompany.supabase.co:5432/postgres'
  );
});

test('rewriteToDirect turns a pooler URI into the direct host', () => {
  const pooled = 'postgresql://postgres.abccompany:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  assert.equal(
    rewriteToDirect(pooled),
    'postgresql://postgres:secret@db.abccompany.supabase.co:5432/postgres'
  );
  assert.equal(
    rewriteToDirect('postgresql://postgres:secret@db.abccompany.supabase.co:5432/postgres'),
    'postgresql://postgres:secret@db.abccompany.supabase.co:5432/postgres'
  );
});

test('connectionCandidates tries a direct URL before a pooled one', () => {
  const pooled = 'postgresql://postgres.abccompany:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  const candidates = connectionCandidates(
    { POSTGRES_URL: pooled, SUPABASE_URL: 'https://abccompany.supabase.co' },
    { supabaseUrl: 'https://abccompany.supabase.co' }
  );
  assert.equal(candidates[0], 'postgresql://postgres:secret@db.abccompany.supabase.co:5432/postgres');
  assert.equal(candidates[1], pooled);
});

test('connectionCandidates prefers an explicit URI and a typed password', () => {
  const candidates = connectionCandidates(
    {},
    {
      supabaseUrl: 'https://abccompany.supabase.co',
      password: 'secret',
      explicitUrl: 'postgresql://postgres:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    }
  );
  assert.equal(candidates[0], 'postgresql://postgres:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres');
  assert.ok(candidates.includes('postgresql://postgres:secret@db.abccompany.supabase.co:5432/postgres'));
});

test('redactSecrets removes connection strings from errors', () => {
  const secret = 'postgresql://postgres:secret@db.abc.supabase.co:5432/postgres';
  assert.equal(redactSecrets(`failed: ${secret}`, [secret]), 'failed: ***');
});
