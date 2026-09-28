const mongoose = require('mongoose');
 
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
 
    // Which module this alert is about — lets you route/filter later.
    // 'MediTrack-Dose' is separate from 'MediTrack' so a "take your medicine now"
    // push never blocks (or gets blocked by) that same medicine's expiry/low-stock alert.
    module: {
      type: String,
      enum: ['MediTrack', 'MediTrack-Dose', 'DocuVault', 'PolicyWatch', 'UtilityDesk', 'PantryIQ', 'HomeCare'],
      required: true
    },
 
    // The specific record this alert is about (e.g. a Medicine _id)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
 
    message: {
      type: String,
      required: true
    },
 
    urgent: {
      type: Boolean,
      default: false
    },
 
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
 
// Prevents creating the same alert twice for the same item on the same day
notificationSchema.index({ userId: 1, module: 1, relatedId: 1, createdAt: 1 });
 
module.exports = mongoose.model('Notification', notificationSchema);
