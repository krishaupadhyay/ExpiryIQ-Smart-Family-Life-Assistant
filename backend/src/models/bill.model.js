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
    paid: { type: Boolean, default: false }
  },
  { timestamps: true }
);

billSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);
