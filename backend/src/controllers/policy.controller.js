const Policy = require('../models/policy.model');
const User = require('../models/user.model');

async function getOwnedFamilyMember(userId, familyMemberId) {
  const user = await User.findById(userId).select('familyMembers');
  if (!user) return null;
  return user.familyMembers.id(familyMemberId) || null;
}

const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.userId }).sort({ renewalDate: 1 });
    return res.json({ policies });
  } catch (error) {
    console.error('Get policies error:', error);
    return res.status(500).json({ message: 'Server error while fetching policies.' });
  }
};

const addPolicy = async (req, res) => {
  try {
    const { familyMemberId, name, type, insurer, policyNo, sumAssured, premium, startDate, renewalDate, alertDaysBefore, contact } = req.body;

    if (!familyMemberId || !name || !type || !renewalDate) {
      return res.status(400).json({ message: 'Family member, name, type and renewal date are required.' });
    }

    const member = await getOwnedFamilyMember(req.userId, familyMemberId);
    if (!member) return res.status(404).json({ message: 'That family member was not found on your account.' });

    const policy = await Policy.create({
      userId: req.userId,
      familyMemberId: member._id,
      memberName: member.name,
      name: name.trim(),
      type,
      insurer: insurer?.trim() || '',
      policyNo: policyNo?.trim() || '',
      sumAssured: sumAssured?.trim() || '',
      premium: Number(premium) || 0,
      startDate: startDate ? new Date(startDate) : null,
      renewalDate: new Date(renewalDate),
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 30,
      contact: contact?.trim() || ''
    });

    return res.status(201).json({ message: 'Policy added successfully.', policy });
  } catch (error) {
    console.error('Add policy error:', error);
    return res.status(500).json({ message: 'Server error while adding policy.' });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, userId: req.userId });
    if (!policy) return res.status(404).json({ message: 'Policy not found.' });

    const fields = ['name', 'type', 'insurer', 'policyNo', 'sumAssured', 'contact'];
    fields.forEach(f => { if (req.body[f] !== undefined) policy[f] = req.body[f]; });
    if (req.body.premium !== undefined) policy.premium = Number(req.body.premium);
    if (req.body.startDate !== undefined) policy.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    if (req.body.renewalDate !== undefined) policy.renewalDate = new Date(req.body.renewalDate);
    if (req.body.alertDaysBefore !== undefined && req.body.alertDaysBefore !== '') policy.alertDaysBefore = Number(req.body.alertDaysBefore);

    await policy.save();
    return res.json({ message: 'Policy updated successfully.', policy });
  } catch (error) {
    console.error('Update policy error:', error);
    return res.status(500).json({ message: 'Server error while updating policy.' });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const result = await Policy.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Policy not found.' });
    return res.json({ message: 'Policy removed successfully.' });
  } catch (error) {
    console.error('Delete policy error:', error);
    return res.status(500).json({ message: 'Server error while deleting policy.' });
  }
};

module.exports = { getPolicies, addPolicy, updatePolicy, deletePolicy };
