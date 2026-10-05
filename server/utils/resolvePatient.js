import mongoose from 'mongoose';
import Patient from '../models/Patient.js';

// Your Patient schema has both Mongo's own _id and a human-readable `id`
// field (e.g. "P-001"). Callers (Postman, the frontend) should be able to
// use either — this tries _id first, then falls back to the custom id.
export default async function resolvePatient(idOrCustomId) {
  if (mongoose.Types.ObjectId.isValid(idOrCustomId)) {
    const byObjectId = await Patient.findById(idOrCustomId);
    if (byObjectId) return byObjectId;
  }
  return Patient.findOne({ id: idOrCustomId });
}
