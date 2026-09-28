
const mongoose = require('mongoose');

// A dose time must be a 24-hour "HH:mm" string, e.g. "08:00", "14:30", "21:15"
const DOSE_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

    // Kept for the existing "Daily Schedule" grouping UI — e.g. ['Morning', 'Night']
    times: {
      type: [String],
      default: [],
      enum: ['Morning', 'Afternoon', 'Night']
    },

    // Exact clock times ("HH:mm", 24-hour, server-local) used to actually fire
    // browser push reminders — e.g. ['08:00', '20:30']
    doseTimes: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every(t => DOSE_TIME_REGEX.test(t)),
        message: 'Each dose time must be in 24-hour HH:mm format, e.g. "08:00".'
      }
    },

    // How many days before expiry the user wants to be alerted
    alertDaysBefore: {
      type: Number,
      default: 7,
      min: 0
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
// Fast lookup for "which medicines have a dose due at this exact HH:mm", used every minute by the scheduler
medicineSchema.index({ doseTimes: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
