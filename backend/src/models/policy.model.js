const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    familyMemberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    memberName: { type: String, required: true, trim: true },

    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['Life', 'Health', 'Vehicle', 'Property', 'Other'] },
    insurer: { type: String, default: '', trim: true },
    policyNo: { type: String, default: '', trim: true },
    sumAssured: { type: String, default: '', trim: true }, // stored as display string e.g. "₹10L" since format varies
    premium: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: null },
    renewalDate: { type: Date, required: true },
    contact: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

policySchema.index({ userId: 1, renewalDate: 1 });

module.exports = mongoose.model('Policy', policySchema);
