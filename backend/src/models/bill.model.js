const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Electricity Bill"
    category: { type: String, required: true, enum: ['Electricity', 'Water', 'Gas', 'Internet', 'LPG', 'Society', 'Other'] },
    provider: { type: String, default: '', trim: true },
    accountNo: { type: String, default: '', trim: true },
    amount: { type: Number, required: true, min: 0 },
    units: { type: String, default: '', trim: true },
    dueDate: { type: Date, required: true },
    // How many days before the due date the user wants to be alerted
    alertDaysBefore: { type: Number, default: 3, min: 0 },
    alertTime: { type: String, default: '08:00', match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'alertTime must be HH:mm'] },
    paid: { type: Boolean, default: false }
  },
  { timestamps: true }
);

billSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);
