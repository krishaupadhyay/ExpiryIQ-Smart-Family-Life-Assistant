const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true }, // birth date — year can be anything, only month/day matters for "next occurrence"
    relation: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Birthday', birthdaySchema);
