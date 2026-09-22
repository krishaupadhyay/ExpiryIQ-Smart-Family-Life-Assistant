const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

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
      required: true,
      enum: ['Identity', 'Financial', 'Medical', 'Property', 'Vehicle', 'Insurance', 'Education', 'Other']
    },

    documentNumber: {
      type: String,
      default: '',
      trim: true
    },

    issueDate: {
      type: Date,
      default: null
    },

    // Optional on purpose — not every document expires (e.g. a PAN card)
    expiry: {
      type: Date,
      default: null
    },

    // 'manual' or 'scan' — for your own records/demo
    source: {
      type: String,
      enum: ['manual', 'scan'],
      default: 'manual'
    }
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, expiry: 1 });

module.exports = mongoose.model('Document', documentSchema);
