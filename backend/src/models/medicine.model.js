
const mongoose = require('mongoose');
 
const medicineSchema = new mongoose.Schema(
  {
    // The family account that owns this medicine record
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
 
    // Which family member (subdocument _id inside User.familyMembers) this is for
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
 
    // Denormalized for easy display/filtering without an extra lookup every time
    memberName: {
      type: String,
      required: true,
      trim: true
    },
 
    name: {
      type: String,
      required: true,
      trim: true
    },
 
    category: {
      type: String,
      default: 'General',
      trim: true
    },
 
    dosage: {
      type: String,
      required: true,
      trim: true
    },
 
    frequency: {
      type: String,
      default: '',
      trim: true
    },
 
    // e.g. ['Morning', 'Night']
    times: {
      type: [String],
      default: [],
      enum: ['Morning', 'Afternoon', 'Night']
    },
 
    total: {
      type: Number,
      required: true,
      min: 0
    },
 
    remaining: {
      type: Number,
      required: true,
      min: 0
    },
 
    expiry: {
      type: Date,
      required: true
    },
 
    // Optional — filled in automatically when added via OCR scan
    mfgDate: {
      type: Date,
      default: null
    },
 
    // 'manual' or 'scan' — just for your own records/demo, not used in logic
    source: {
      type: String,
      enum: ['manual', 'scan'],
      default: 'manual'
    }
  },
  { timestamps: true }
);
 
// Fast lookups for "all medicines for this family" and sorting by soonest expiry
medicineSchema.index({ userId: 1, expiry: 1 });
 
module.exports = mongoose.model('Medicine', medicineSchema);
 
