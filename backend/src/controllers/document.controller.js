const Document = require('../models/document.model');
const { cleanAlertTime } = require('../utils/alertTime');
const User = require('../models/user.model');


async function getOwnedFamilyMember(userId, familyMemberId) {
  const user = await User.findById(userId).select('familyMembers');
  if (!user) return null;
  const member = user.familyMembers.id(familyMemberId);
  return member || null;
}


// ===============================
// GET ALL DOCUMENTS (for the whole family account)
// ===============================

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    return res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ message: 'Server error while fetching documents.' });
  }
};


// ===============================
// ADD DOCUMENT
// ===============================

const addDocument = async (req, res) => {
  try {
    const {
      familyMemberId,
      name,
      category,
      documentNumber,
      issueDate,
      expiry,
      alertDaysBefore,
      alertTime,
      source
    } = req.body;

    if (!familyMemberId || !name || !category) {
      return res.status(400).json({
        message: 'Family member, name and category are required.'
      });
    }

    const member = await getOwnedFamilyMember(req.userId, familyMemberId);

    if (!member) {
      return res.status(404).json({
        message: 'That family member was not found on your account.'
      });
    }

    const document = await Document.create({
      userId: req.userId,
      familyMemberId: member._id,
      memberName: member.name,
      name: name.trim(),
      category,
      documentNumber: documentNumber?.trim() || '',
      issueDate: issueDate ? new Date(issueDate) : null,
      expiry: expiry ? new Date(expiry) : null,
      alertDaysBefore: alertDaysBefore !== undefined && alertDaysBefore !== '' ? Number(alertDaysBefore) : 30,
      alertTime: cleanAlertTime(alertTime),
      source: source === 'scan' ? 'scan' : 'manual'
    });

    return res.status(201).json({
      message: 'Document added successfully.',
      document
    });

  } catch (error) {
    console.error('Add document error:', error);
    return res.status(500).json({ message: 'Server error while adding document.' });
  }
};


// ===============================
// UPDATE DOCUMENT
// ===============================

const updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const {
      familyMemberId,
      name,
      category,
      documentNumber,
      issueDate,
      expiry,
      alertDaysBefore,
      alertTime
    } = req.body;

    if (familyMemberId && familyMemberId !== String(document.familyMemberId)) {
      const member = await getOwnedFamilyMember(req.userId, familyMemberId);
      if (!member) {
        return res.status(404).json({ message: 'That family member was not found on your account.' });
      }
      document.familyMemberId = member._id;
      document.memberName = member.name;
    }

    if (name !== undefined) document.name = name.trim();
    if (category !== undefined) document.category = category;
    if (documentNumber !== undefined) document.documentNumber = documentNumber.trim();
    if (issueDate !== undefined) document.issueDate = issueDate ? new Date(issueDate) : null;
    if (expiry !== undefined) document.expiry = expiry ? new Date(expiry) : null;
    if (alertDaysBefore !== undefined && alertDaysBefore !== '') document.alertDaysBefore = Number(alertDaysBefore);
    if (alertTime !== undefined) document.alertTime = cleanAlertTime(alertTime);

    await document.save();

    return res.json({
      message: 'Document updated successfully.',
      document
    });

  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({ message: 'Server error while updating document.' });
  }
};


// ===============================
// DELETE DOCUMENT
// ===============================

const deleteDocument = async (req, res) => {
  try {
    const result = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    return res.json({ message: 'Document removed successfully.' });

  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ message: 'Server error while deleting document.' });
  }
};


module.exports = { getDocuments, addDocument, updateDocument, deleteDocument };
