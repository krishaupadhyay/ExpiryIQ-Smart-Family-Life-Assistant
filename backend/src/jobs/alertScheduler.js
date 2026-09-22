const cron = require('node-cron');
const Medicine = require('../models/medicine.model');
const Document = require('../models/document.model');
const Notification = require('../models/notification.model');
const { sendPushToUser } = require('../controllers/push.controller');

const EXPIRY_WARNING_DAYS = 7;
const DOCUMENT_WARNING_DAYS = 30; // documents get a longer lead time — renewals take longer than a medicine refill
const LOW_STOCK_RATIO = 0.2; // 20% remaining or less

async function alreadyAlertedRecently(userId, module, relatedId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await Notification.findOne({
    userId,
    module,
    relatedId,
    createdAt: { $gte: oneDayAgo }
  });
  return !!existing;
}

async function checkMedicineAlerts() {
  console.log('[alerts] Checking MediTrack expiry/stock...');
  const medicines = await Medicine.find({});
  let created = 0;

  for (const med of medicines) {
    const daysToExpiry = Math.ceil((med.expiry.getTime() - Date.now()) / 86400000);
    const stockRatio = med.total > 0 ? med.remaining / med.total : 1;

    const isExpiringSoon = daysToExpiry <= EXPIRY_WARNING_DAYS;
    const isLowStock = stockRatio <= LOW_STOCK_RATIO;

    if (!isExpiringSoon && !isLowStock) continue;
    if (await alreadyAlertedRecently(med.userId, 'MediTrack', med._id)) continue;

    let message;
    if (isExpiringSoon && daysToExpiry >= 0) {
      message = `${med.name} for ${med.memberName} expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}.`;
    } else if (isExpiringSoon && daysToExpiry < 0) {
      message = `${med.name} for ${med.memberName} has expired.`;
    } else {
      message = `${med.name} for ${med.memberName} is running low (${med.remaining}/${med.total} left).`;
    }

    await Notification.create({
      userId: med.userId,
      module: 'MediTrack',
      relatedId: med._id,
      message,
      urgent: isExpiringSoon
    });

    await sendPushToUser(med.userId, {
      title: isExpiringSoon ? '⚠️ Medicine Expiring' : '💊 Low Stock',
      body: message,
      url: '/meditrack'
    });

    created++;
  }

  console.log(`[alerts] MediTrack: created ${created} new notification(s).`);
}

async function checkDocumentAlerts() {
  console.log('[alerts] Checking DocuVault expiry...');
  // Only documents that actually have an expiry date set — many (e.g. PAN) don't expire
  const documents = await Document.find({ expiry: { $ne: null } });
  let created = 0;

  for (const doc of documents) {
    const daysToExpiry = Math.ceil((doc.expiry.getTime() - Date.now()) / 86400000);
    const isExpiringSoon = daysToExpiry <= DOCUMENT_WARNING_DAYS;

    if (!isExpiringSoon) continue;
    if (await alreadyAlertedRecently(doc.userId, 'DocuVault', doc._id)) continue;

    let message;
    if (daysToExpiry >= 0) {
      message = `${doc.name} (${doc.memberName}) expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'} — renewal recommended.`;
    } else {
      message = `${doc.name} (${doc.memberName}) has expired.`;
    }

    await Notification.create({
      userId: doc.userId,
      module: 'DocuVault',
      relatedId: doc._id,
      message,
      urgent: daysToExpiry <= 7
    });

    await sendPushToUser(doc.userId, {
      title: '📄 Document Expiring',
      body: message,
      url: '/docuvault'
    });

    created++;
  }

  console.log(`[alerts] DocuVault: created ${created} new notification(s).`);
}

async function runAllAlertChecks() {
  try {
    await checkMedicineAlerts();
    await checkDocumentAlerts();
  } catch (error) {
    console.error('[alerts] Error running alert checks:', error);
  }
}

// Runs once every day at 8:00 AM server time.
// For testing right now, you can temporarily change this to run every minute: '* * * * *'
function startAlertScheduler() {
  cron.schedule('0 8 * * *', runAllAlertChecks);
  console.log('[alerts] Scheduler started — daily check at 8:00 AM.');
}

module.exports = { startAlertScheduler, checkMedicineAlerts, checkDocumentAlerts, runAllAlertChecks };
