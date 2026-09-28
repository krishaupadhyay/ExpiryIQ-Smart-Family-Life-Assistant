const Appliance = require('../models/appliance.model');

const getAppliances = async (req, res) => {
  try {
    const appliances = await Appliance.find({ userId: req.userId }).sort({ warrantyExpiry: 1 });
    return res.json({ appliances });
  } catch (error) {
    console.error('Get appliances error:', error);
    return res.status(500).json({ message: 'Server error while fetching appliances.' });
  }
};

const addAppliance = async (req, res) => {
  try {
    const { name, category, brand, model, warrantyExpiry, alertDaysBefore, lastService, nextService, notes } = req.body;

    if (!name || !category || !warrantyExpiry) {
      return res.status(400).json({ message: 'Name, category and warranty expiry are required.' });
    }

    const appliance = await Appliance.create({
      userId: req.userId,
      name: name.trim(),
      category,
      brand: brand?.trim() || '',
      model: model?.trim() || '',
      warrantyExpiry: new Date(warrantyExpiry),
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 30,
      lastService: lastService ? new Date(lastService) : null,
      nextService: nextService ? new Date(nextService) : null,
      notes: notes?.trim() || ''
    });

    return res.status(201).json({ message: 'Appliance added successfully.', appliance });
  } catch (error) {
    console.error('Add appliance error:', error);
    return res.status(500).json({ message: 'Server error while adding appliance.' });
  }
};

const updateAppliance = async (req, res) => {
  try {
    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.userId });
    if (!appliance) return res.status(404).json({ message: 'Appliance not found.' });

    const fields = ['name', 'category', 'brand', 'model', 'notes'];
    fields.forEach(f => { if (req.body[f] !== undefined) appliance[f] = req.body[f]; });
    if (req.body.warrantyExpiry !== undefined) appliance.warrantyExpiry = new Date(req.body.warrantyExpiry);
    if (req.body.alertDaysBefore !== undefined && req.body.alertDaysBefore !== '') appliance.alertDaysBefore = Number(req.body.alertDaysBefore);
    if (req.body.lastService !== undefined) appliance.lastService = req.body.lastService ? new Date(req.body.lastService) : null;
    if (req.body.nextService !== undefined) appliance.nextService = req.body.nextService ? new Date(req.body.nextService) : null;

    await appliance.save();
    return res.json({ message: 'Appliance updated successfully.', appliance });
  } catch (error) {
    console.error('Update appliance error:', error);
    return res.status(500).json({ message: 'Server error while updating appliance.' });
  }
};

const deleteAppliance = async (req, res) => {
  try {
    const result = await Appliance.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Appliance not found.' });
    return res.json({ message: 'Appliance removed successfully.' });
  } catch (error) {
    console.error('Delete appliance error:', error);
    return res.status(500).json({ message: 'Server error while deleting appliance.' });
  }
};

module.exports = { getAppliances, addAppliance, updateAppliance, deleteAppliance };
