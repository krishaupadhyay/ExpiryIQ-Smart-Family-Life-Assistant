const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['Grains & Dal', 'Dairy', 'Vegetables', 'Spices', 'Oils & Ghee', 'Snacks', 'Beverages', 'Other'] },
    quantity: { type: Number, required: true, min: 0 },
    maxQty: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'units', trim: true },
    expiry: { type: Date, required: true },
    // How many days before expiry the user wants to be alerted
    alertDaysBefore: { type: Number, default: 7, min: 0 }
  },
  { timestamps: true }
);

pantryItemSchema.index({ userId: 1, expiry: 1 });

module.exports = mongoose.model('PantryItem', pantryItemSchema);
