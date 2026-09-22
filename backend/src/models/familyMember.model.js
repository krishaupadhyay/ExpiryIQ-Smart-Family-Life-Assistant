const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true,
      enum: [
        'Father',
        'Mother',
        'Son',
        'Daughter',
        'Brother',
        'Sister',
        'Grandfather',
        'Grandmother',
        'Aunt',
        'Uncle',
        'Cousin',
        'Other'
      ]
    },
    age: {
      type: Number,
      min: 0,
      max: 120
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyMember', familyMemberSchema);