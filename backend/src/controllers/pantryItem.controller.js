const PantryItem = require('../models/pantryItem.model');
const { cleanAlertTime } = require('../utils/alertTime');

const getItems = async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.userId }).sort({ expiry: 1 });
    return res.json({ items });
  } catch (error) {
    console.error('Get pantry items error:', error);
    return res.status(500).json({ message: 'Server error while fetching pantry items.' });
  }
};

const addItem = async (req, res) => {
  try {
    const { name, category, quantity, maxQty, unit, expiry, alertDaysBefore, alertTime } = req.body;

    if (!name || !category || quantity === undefined || maxQty === undefined || !expiry) {
      return res.status(400).json({ message: 'Name, category, quantity, max quantity and expiry are required.' });
    }

    const item = await PantryItem.create({
      userId: req.userId,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      maxQty: Number(maxQty),
      unit: unit?.trim() || 'units',
      expiry: new Date(expiry),
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 7,
      alertTime: cleanAlertTime(alertTime)
    });

    return res.status(201).json({ message: 'Item added successfully.', item });
  } catch (error) {
    console.error('Add pantry item error:', error);
    return res.status(500).json({ message: 'Server error while adding item.' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await PantryItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const fields = ['name', 'category', 'unit'];
    fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    if (req.body.quantity !== undefined) item.quantity = Number(req.body.quantity);
    if (req.body.maxQty !== undefined) item.maxQty = Number(req.body.maxQty);
    if (req.body.expiry !== undefined) item.expiry = new Date(req.body.expiry);
    if (req.body.alertDaysBefore !== undefined && req.body.alertDaysBefore !== '') item.alertDaysBefore = Number(req.body.alertDaysBefore);
    if (req.body.alertTime !== undefined) item.alertTime = cleanAlertTime(req.body.alertTime);

    await item.save();
    return res.json({ message: 'Item updated successfully.', item });
  } catch (error) {
    console.error('Update pantry item error:', error);
    return res.status(500).json({ message: 'Server error while updating item.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const result = await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Item not found.' });
    return res.json({ message: 'Item removed successfully.' });
  } catch (error) {
    console.error('Delete pantry item error:', error);
    return res.status(500).json({ message: 'Server error while deleting item.' });
  }
};

module.exports = { getItems, addItem, updateItem, deleteItem };
