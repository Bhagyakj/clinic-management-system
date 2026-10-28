import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrescriptionMeds } from './prescriptionUtils.js';

test('normalizes medicine rows before saving a patient prescription', () => {
  const normalized = normalizePrescriptionMeds([
    { name: ' Paracetamol 500mg ', dosage: '1-0-1' },
    { name: 'Amoxicillin', dosage: ' 1-1-0 ' },
    { name: '', dosage: 'ignored' },
  ]);

  assert.deepEqual(normalized, [
    { name: 'Paracetamol 500mg', dosage: '1-0-1' },
    { name: 'Amoxicillin', dosage: '1-1-0' },
  ]);
});
