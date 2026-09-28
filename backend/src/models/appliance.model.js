const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['Air Conditioner', 'Washing Machine', 'Refrigerator', 'Television', 'Water Purifier', 'Microwave', 'Fan', 'Gas Stove', 'Other'] },
    brand: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },
    warrantyExpiry: { type: Date, required: true },
    // How many days before warranty expiry the user wants to be alerted
    alertDaysBefore: { type: Number, default: 30, min: 0 },
    lastService: { type: Date, default: null },
    nextService: { type: Date, default: null },
    notes: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

applianceSchema.index({ userId: 1, nextService: 1 });

module.exports = mongoose.model('Appliance', applianceSchema);
