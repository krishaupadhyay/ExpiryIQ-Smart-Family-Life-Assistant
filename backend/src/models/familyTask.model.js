const mongoose = require('mongoose');

const familyTaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    due: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    memberName: { type: String, default: '', trim: true },
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyTask', familyTaskSchema);
