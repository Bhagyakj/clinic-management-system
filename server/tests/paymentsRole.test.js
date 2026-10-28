import test from 'node:test';
import assert from 'node:assert/strict';
import requireRole from '../middleware/requireRole.js';

test('Pharmacist is allowed to create pharmacy bills', () => {
  const middleware = requireRole('Manager', 'Front Office Staff', 'Nurse', 'Pharmacist');

  let nextCalled = false;
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json() {
      return this;
    },
  };

  middleware({ user: { role: 'Pharmacist' } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true, 'Pharmacist should be allowed to prepare bills');
  assert.equal(res.code, undefined, 'role middleware should not reject the pharmacist');
});
