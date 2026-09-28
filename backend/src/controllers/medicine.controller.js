
const Medicine = require('../models/medicine.model');
const User = require('../models/user.model');

const DOSE_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function cleanDoseTimes(doseTimes) {
  if (!Array.isArray(doseTimes)) return [];
  // keep only valid, unique "HH:mm" strings
  const valid = doseTimes.filter(t => typeof t === 'string' && DOSE_TIME_REGEX.test(t));
  return [...new Set(valid)];
}

// ===============================
// HELPER: verify the familyMemberId actually belongs to this user,
// and return that member's name (so we can store memberName denormalized)
// ===============================

async function getOwnedFamilyMember(userId, familyMemberId) {
  const user = await User.findById(userId).select('familyMembers');

  if (!user) {
    return null;
  }

  const member = user.familyMembers.id(familyMemberId);
  return member || null;
}


// ===============================
// GET ALL MEDICINES (for the whole family account)
// ===============================

const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId })
      .sort({ expiry: 1 });

    return res.json({ medicines });

  } catch (error) {
    console.error('Get medicines error:', error);
    return res.status(500).json({ message: 'Server error while fetching medicines.' });
  }
};


// ===============================
// ADD MEDICINE
// ===============================

const addMedicine = async (req, res) => {
  try {
    const {
      familyMemberId,
      name,
      category,
      dosage,
      frequency,
      times,
      doseTimes,
      alertDaysBefore,
      total,
      remaining,
      expiry,
      mfgDate,
      source
    } = req.body;

    if (!familyMemberId || !name || !dosage || total === undefined || remaining === undefined || !expiry) {
      return res.status(400).json({
        message: 'Family member, name, dosage, total, remaining and expiry are required.'
      });
    }

    // Confirm this family member actually belongs to the logged-in account
    const member = await getOwnedFamilyMember(req.userId, familyMemberId);

    if (!member) {
      return res.status(404).json({
        message: 'That family member was not found on your account.'
      });
    }

    const medicine = await Medicine.create({
      userId: req.userId,
      familyMemberId: member._id,
      memberName: member.name,
      name: name.trim(),
      category: category?.trim() || 'General',
      dosage: dosage.trim(),
      frequency: frequency?.trim() || '',
      times: Array.isArray(times) ? times : [],
      doseTimes: cleanDoseTimes(doseTimes),
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 7,
      total: Number(total),
      remaining: Number(remaining),
      expiry: new Date(expiry),
      mfgDate: mfgDate ? new Date(mfgDate) : null,
      source: source === 'scan' ? 'scan' : 'manual'
    });

    return res.status(201).json({
      message: 'Medicine added successfully.',
      medicine
    });

  } catch (error) {
    console.error('Add medicine error:', error);
    return res.status(500).json({ message: 'Server error while adding medicine.' });
  }
};


// ===============================
// UPDATE MEDICINE
// ===============================

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    const {
      familyMemberId,
      name,
      category,
      dosage,
      frequency,
      times,
      doseTimes,
      alertDaysBefore,
      total,
      remaining,
      expiry
    } = req.body;

    // If reassigning to a different family member, verify ownership again
    if (familyMemberId && familyMemberId !== String(medicine.familyMemberId)) {
      const member = await getOwnedFamilyMember(req.userId, familyMemberId);

      if (!member) {
        return res.status(404).json({
          message: 'That family member was not found on your account.'
        });
      }

      medicine.familyMemberId = member._id;
      medicine.memberName = member.name;
    }

    if (name !== undefined) medicine.name = name.trim();
    if (category !== undefined) medicine.category = category.trim();
    if (dosage !== undefined) medicine.dosage = dosage.trim();
    if (frequency !== undefined) medicine.frequency = frequency.trim();
    if (times !== undefined) medicine.times = times;
    if (doseTimes !== undefined) medicine.doseTimes = cleanDoseTimes(doseTimes);
    if (alertDaysBefore !== undefined && alertDaysBefore !== '') medicine.alertDaysBefore = Number(alertDaysBefore);
    if (total !== undefined) medicine.total = Number(total);
    if (remaining !== undefined) medicine.remaining = Number(remaining);
    if (expiry !== undefined) medicine.expiry = new Date(expiry);

    await medicine.save();

    return res.json({
      message: 'Medicine updated successfully.',
      medicine
    });

  } catch (error) {
    console.error('Update medicine error:', error);
    return res.status(500).json({ message: 'Server error while updating medicine.' });
  }
};


// ===============================
// DELETE MEDICINE
// ===============================

const deleteMedicine = async (req, res) => {
  try {
    const result = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    return res.json({ message: 'Medicine removed successfully.' });

  } catch (error) {
    console.error('Delete medicine error:', error);
    return res.status(500).json({ message: 'Server error while deleting medicine.' });
  }
};


module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine
};
