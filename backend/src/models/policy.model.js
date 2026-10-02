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
    // How many days before renewal the user wants to be alerted
    alertDaysBefore: { type: Number, default: 30, min: 0 },
    alertTime: { type: String, default: '08:00', match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'alertTime must be HH:mm'] },
    contact: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

policySchema.index({ userId: 1, renewalDate: 1 });

module.exports = mongoose.model('Policy', policySchema);
