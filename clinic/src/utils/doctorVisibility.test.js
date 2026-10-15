import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getVisibleDoctorIdsForUser,
  normalizeAppointmentDateKey,
  normalizeAppointmentTimeKey,
  appointmentMatchesFilters,
} from './doctorVisibility.js';

const doctors = [
  { _id: 'doc-senior-a', userId: 'user-senior-a', name: 'Dr. A' },
  { _id: 'doc-junior-x', userId: 'user-junior-x', name: 'Dr. X' },
  { _id: 'doc-senior-b', userId: 'user-senior-b', name: 'Dr. B' },
];

test('junior doctor sees their own and assigned senior doctor appointments', () => {
  const visible = getVisibleDoctorIdsForUser({
    role: 'jdoc',
    userId: 'user-junior-x',
    userName: 'Dr. X',
    reportingDoctorId: 'user-senior-a',
    doctors,
  });

  assert.deepEqual(visible.sort(), ['doc-junior-x', 'doc-senior-a'].sort());
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

test('appointment filters match selected status and local date without timezone drift', () => {
  assert.equal(normalizeAppointmentDateKey('2025-03-21T00:00:00.000Z'), '2025-03-21');
  assert.equal(normalizeAppointmentTimeKey('09:00 AM'), '09:00');
  assert.equal(normalizeAppointmentTimeKey('9:00am'), '09:00');

  const appointment = {
    _id: 'appt-1',
    doctorId: 'doc-senior-a',
    date: '2025-03-21T00:00:00.000Z',
    time: '09:00 AM',
    status: 'confirmed',
    patientId: 'p-1',
  };

  assert.equal(
    appointmentMatchesFilters(appointment, { selectedDoctorId: 'all', selectedStatus: 'confirmed', selectedDate: '2025-03-21' }),
    true,
  );
  assert.equal(
    appointmentMatchesFilters(appointment, { selectedDoctorId: 'all', selectedStatus: 'completed', selectedDate: '2025-03-21' }),
    false,
  );
  assert.equal(
    normalizeAppointmentTimeKey('09:00 AM') === normalizeAppointmentTimeKey('9:00am'),
    true,
  );
});
