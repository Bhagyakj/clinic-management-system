export function normalizePrescriptionMeds(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      name: String(row?.name ?? '').trim(),
      dosage: String(row?.dosage ?? '').trim(),
    }))
    .filter((row) => row.name && row.dosage);
}
