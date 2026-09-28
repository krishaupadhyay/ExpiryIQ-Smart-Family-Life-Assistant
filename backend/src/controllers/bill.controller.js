const Bill = require('../models/bill.model');
const { cleanAlertTime } = require('../utils/alertTime');

const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.userId }).sort({ dueDate: 1 });
    return res.json({ bills });
  } catch (error) {
    console.error('Get bills error:', error);
    return res.status(500).json({ message: 'Server error while fetching bills.' });
  }
};

const addBill = async (req, res) => {
  try {
    const { name, category, provider, accountNo, amount, units, dueDate, alertDaysBefore, alertTime } = req.body;

    if (!name || !category || amount === undefined || !dueDate) {
      return res.status(400).json({ message: 'Name, category, amount and due date are required.' });
    }

    const bill = await Bill.create({
      userId: req.userId,
      name: name.trim(),
      category,
      provider: provider?.trim() || '',
      accountNo: accountNo?.trim() || '',
      amount: Number(amount),
      units: units?.trim() || '',
      dueDate: new Date(dueDate),
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 3,
      alertTime: cleanAlertTime(alertTime)
    });

    return res.status(201).json({ message: 'Bill added successfully.', bill });
  } catch (error) {
    console.error('Add bill error:', error);
    return res.status(500).json({ message: 'Server error while adding bill.' });
  }
};

const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.userId });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });

    const fields = ['name', 'category', 'provider', 'accountNo', 'units'];
    fields.forEach(f => { if (req.body[f] !== undefined) bill[f] = req.body[f]; });
    if (req.body.amount !== undefined) bill.amount = Number(req.body.amount);
    if (req.body.dueDate !== undefined) bill.dueDate = new Date(req.body.dueDate);
    if (req.body.alertDaysBefore !== undefined && req.body.alertDaysBefore !== '') bill.alertDaysBefore = Number(req.body.alertDaysBefore);
    if (req.body.alertTime !== undefined) bill.alertTime = cleanAlertTime(req.body.alertTime);
    if (req.body.paid !== undefined) bill.paid = req.body.paid;

    await bill.save();
    return res.json({ message: 'Bill updated successfully.', bill });
  } catch (error) {
    console.error('Update bill error:', error);
    return res.status(500).json({ message: 'Server error while updating bill.' });
  }
};

const deleteBill = async (req, res) => {
  try {
    const result = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Bill not found.' });
    return res.json({ message: 'Bill removed successfully.' });
  } catch (error) {
    console.error('Delete bill error:', error);
    return res.status(500).json({ message: 'Server error while deleting bill.' });
  }
};

module.exports = { getBills, addBill, updateBill, deleteBill };
