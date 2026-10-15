import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleDoctorIdsForUser } from './doctorVisibility.js';

const doctors = [
  { _id: 'doc-senior-a', userId: 'user-senior-a', name: 'Dr. A' },
  { _id: 'doc-junior-x', userId: 'user-junior-x', name: 'Dr. X' },
  { _id: 'doc-senior-b', userId: 'user-senior-b', name: 'Dr. B' },
];

test('junior doctor can only see the assigned senior doctor appointments', () => {
  const visible = getVisibleDoctorIdsForUser({
    role: 'jdoc',
    userId: 'user-junior-x',
    userName: 'Dr. X',
    reportingDoctorId: 'user-senior-a',
    doctors,
  });

  assert.deepEqual(visible, ['doc-senior-a']);
});

test('senior doctor sees only their own appointment list', () => {
  const visible = getVisibleDoctorIdsForUser({
    role: 'sdoc',
    userId: 'user-senior-a',
    userName: 'Dr. A',
    reportingDoctorId: null,
    doctors,
  });

  assert.deepEqual(visible, ['doc-senior-a']);
});
