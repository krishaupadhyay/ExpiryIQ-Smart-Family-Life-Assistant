const mongoose = require('mongoose');

const familyEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: { type: String, default: 'General', trim: true },
    memberName: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyEvent', familyEventSchema);
