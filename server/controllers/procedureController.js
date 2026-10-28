import Procedure from '../models/Procedure.js';

export const listProcedures = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: String(search).trim(), $options: 'i' };
    }

    const procedures = await Procedure.find(filter).sort({ name: 1 });
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProcedure = async (req, res) => {
  try {
    const { name, description, unitCost, status } = req.body || {};
    const cleanName = String(name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ message: 'Procedure name is required.' });
    }

    const procedure = await Procedure.create({
      name: cleanName,
      description: String(description || '').trim(),
      unitCost: Number(unitCost) || 0,
      status: status || 'Active',
    });

    res.status(201).json(procedure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProcedure = async (req, res) => {
  try {
    const updates = { ...req.body };
    const procedure = await Procedure.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!procedure) return res.status(404).json({ message: 'Procedure not found' });
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleProcedureStatus = async (req, res) => {
  try {
    const procedure = await Procedure.findById(req.params.id);
    if (!procedure) return res.status(404).json({ message: 'Procedure not found' });

    procedure.status = procedure.status === 'Active' ? 'Archived' : 'Active';
    await procedure.save();
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
