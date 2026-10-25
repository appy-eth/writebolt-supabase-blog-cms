import assert from 'node:assert/strict';
import test from 'node:test';
import { applyBase, isLocalUrl, normalizeBase } from './paths.mjs';

test('normalizeBase trims an optional mount', () => {
  assert.equal(normalizeBase(''), '');
  assert.equal(normalizeBase('/'), '');
  assert.equal(normalizeBase('blog'), '/blog');
  assert.equal(normalizeBase('/blog/'), '/blog');
});

test('applyBase prefixes blog links once', () => {
  assert.equal(applyBase('', '/category/news'), '/category/news');
  assert.equal(applyBase('/blog', '/'), '/blog');
  assert.equal(applyBase('/blog', '/category/news'), '/blog/category/news');
  assert.equal(applyBase('/blog', '/blog/category/news'), '/blog/category/news');
  assert.equal(applyBase('/blog', '/blog'), '/blog');
  assert.equal(applyBase('/blog', '/admin?status=draft'), '/blog/admin?status=draft');
  assert.equal(applyBase('/blog', '/blog/admin?x=1'), '/blog/admin?x=1');
});

test('isLocalUrl catches dev origins only', () => {
  assert.equal(isLocalUrl('http://localhost:4321'), true);
  assert.equal(isLocalUrl('http://127.0.0.1:4322'), true);
  assert.equal(isLocalUrl('https://holidaynannies.com'), false);
});
