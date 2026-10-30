import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('P16 admin dashboard is explicitly prototype-only and inventory is read-only', () => {
  const page = read('src/app/admin/page.tsx');
  assert.match(page, /Prototype-only controls/);
  assert.match(page, /Digital keys inventory/);
  assert.match(page, /Physical gear inventory/);
  assert.match(page, /Full demo reset stays CLI-only/);
  assert.doesNotMatch(page, /cardNumber|stripeSecret|process\.env/);
});

test('P16 admin mutations enforce admin role and protect the last admin', () => {
  const action = read('src/actions/admin.ts');
  assert.match(action, /session\?\.user\?\.role !== 'ADMIN'/);
  assert.match(action, /At least one admin must remain/);
  assert.match(action, /You cannot remove your own admin role/);
  assert.match(action, /roleSchema\.safeParse/);
});

test('P16 community moderation is soft-delete only and server-authorized', () => {
  const action = read('src/actions/admin.ts');
  const component = read('src/components/admin/ModerationList.tsx');
  assert.match(action, /moderateComment/);
  assert.match(action, /isDeleted: true/);
  assert.match(component, /window\.confirm/);
  assert.match(component, /soft-moderation/);
  assert.doesNotMatch(action, /comment\.delete|deleteMany/);
});

test('P16 role controls require explicit confirmation and surface errors', () => {
  const component = read('src/components/admin/RoleSelect.tsx');
  assert.match(component, /Confirm changing this demo user/);
  assert.match(component, /catch \(error\)/);
  assert.match(component, /Role updated/);
});

test('P16 deterministic maintenance is non-destructive and confirmation-gated', () => {
  const action = read('src/actions/admin.ts');
  const component = read('src/components/admin/DemoMaintenance.tsx');
  assert.match(action, /recalculateDemoScores/);
  assert.match(action, /confirmation !== 'CONFIRM'/);
  assert.match(component, /No users, products, orders, or comments will be deleted/);
  assert.match(component, /full destructive seed remains CLI-only/);
});
