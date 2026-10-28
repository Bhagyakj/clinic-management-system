import Medicine from '../models/Medicine.js';

export const listMedicines = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: String(search).trim(), $options: 'i' };
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const { name, scientificName, unitCost, quantity, status } = req.body || {};
    const cleanName = String(name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ message: 'Medicine name is required.' });
    }

    const medicine = await Medicine.create({
      name: cleanName,
      scientificName: String(scientificName || '').trim(),
      unitCost: Number(unitCost) || 0,
      quantity: Number(quantity) || 0,
      status: status || 'Active',
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const updates = { ...req.body };
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleMedicineStatus = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    medicine.status = medicine.status === 'Active' ? 'Archived' : 'Active';
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
