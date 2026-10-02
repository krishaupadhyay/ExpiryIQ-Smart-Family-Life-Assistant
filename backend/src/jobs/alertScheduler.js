const cron = require('node-cron');
const Medicine = require('../models/medicine.model');
const Document = require('../models/document.model');
const Bill = require('../models/bill.model');
const Policy = require('../models/policy.model');
const PantryItem = require('../models/pantryItem.model');
const Appliance = require('../models/appliance.model');
const Notification = require('../models/notification.model');
const { sendPushToUser } = require('../controllers/push.controller');

const LOW_STOCK_RATIO = 0.2; // 20% remaining or less, still fixed — not date-based, so no "days before" applies

// One alert per item per calendar day (server-local), so the user's chosen
// alert time controls *when* it fires and it doesn't repeat all day.
async function alreadyAlertedRecently(userId, module, relatedId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const existing = await Notification.findOne({
    userId,
    module,
    relatedId,
    createdAt: { $gte: startOfToday }
  });
  return !!existing;
}

// True once the server clock has reached the item's chosen alert time today ("HH:mm").
// If the item only just entered its alert window after that time, it fires right away.
function isTimeReached(alertTime) {
  const nowHHmm = new Date().toTimeString().slice(0, 5);
  return nowHHmm >= (alertTime || '08:00');
}

// ===============================
// GENERIC "expiring / renewing / due soon" CHECK
// Reused across Document, Bill, Policy, PantryItem and Appliance — each item
// supplies its own alertDaysBefore, so the lead time is per-item, not module-wide.
// ===============================
async function checkExpiryAlerts({ Model, module, dateField, defaultAlertDays, buildMessage, pushTitle, pushUrl, extraFilter = {} }) {
  const items = await Model.find({ [dateField]: { $ne: null }, ...extraFilter });
  let created = 0;

  for (const item of items) {
    const dateValue = item[dateField];
    if (!dateValue) continue;

    const alertDays = typeof item.alertDaysBefore === 'number' ? item.alertDaysBefore : defaultAlertDays;
    const daysLeft = Math.ceil((new Date(dateValue).getTime() - Date.now()) / 86400000);

    if (daysLeft > alertDays) continue;
    if (!isTimeReached(item.alertTime)) continue;
    if (await alreadyAlertedRecently(item.userId, module, item._id)) continue;

    const message = buildMessage(item, daysLeft);

    await Notification.create({
      userId: item.userId,
      module,
      relatedId: item._id,
      message,
      urgent: daysLeft <= 3
    });

    await sendPushToUser(item.userId, {
      title: pushTitle,
      body: message,
      url: pushUrl
    });

    created++;
  }

  if (created > 0) console.log(`[alerts] ${module}: created ${created} new notification(s).`);
}

// ===============================
// MEDICINE: expiry (per-item alertDaysBefore) + low stock (fixed ratio)
// ===============================
async function checkMedicineAlerts() {
  const medicines = await Medicine.find({});
  let created = 0;

  for (const med of medicines) {
    const alertDays = typeof med.alertDaysBefore === 'number' ? med.alertDaysBefore : 7;
    const daysToExpiry = Math.ceil((med.expiry.getTime() - Date.now()) / 86400000);
    const stockRatio = med.total > 0 ? med.remaining / med.total : 1;

    const isExpiringSoon = daysToExpiry <= alertDays;
    const isLowStock = stockRatio <= LOW_STOCK_RATIO;

    if (!isExpiringSoon && !isLowStock) continue;
    if (!isTimeReached(med.alertTime)) continue;
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

  if (created > 0) console.log(`[alerts] MediTrack: created ${created} new notification(s).`);
}

// ===============================
// MEDICINE DOSE REMINDERS — separate from expiry/stock, runs every minute.
// Fires a push the moment the server's current "HH:mm" matches one of a
// medicine's doseTimes, e.g. ["08:00", "20:30"].
// ===============================
async function checkMedicineDoseReminders() {
  const currentTime = new Date().toTimeString().slice(0, 5); // "HH:mm", server-local time
  const medicines = await Medicine.find({ doseTimes: currentTime });
  if (medicines.length === 0) return;

  let created = 0;

  for (const med of medicines) {
    // Guard against double-firing if the cron tick overlaps itself — one alert per medicine per minute
    const firedThisMinute = await Notification.findOne({
      userId: med.userId,
      module: 'MediTrack-Dose',
      relatedId: med._id,
      createdAt: { $gte: new Date(Date.now() - 55 * 1000) }
    });
    if (firedThisMinute) continue;

    const message = `Time to take ${med.name} (${med.dosage}) for ${med.memberName} — ${currentTime}.`;

    await Notification.create({
      userId: med.userId,
      module: 'MediTrack-Dose',
      relatedId: med._id,
      message,
      urgent: false
    });

    await sendPushToUser(med.userId, {
      title: '💊 Medicine Time',
      body: message,
      url: '/meditrack'
    });

    created++;
  }

  if (created > 0) console.log(`[alerts] MediTrack dose reminders: sent ${created}.`);
}

async function checkDocumentAlerts() {
  return checkExpiryAlerts({
    Model: Document,
    module: 'DocuVault',
    dateField: 'expiry',
    defaultAlertDays: 30,
    pushTitle: '📄 Document Expiring',
    pushUrl: '/docuvault',
    buildMessage: (doc, daysLeft) => daysLeft >= 0
      ? `${doc.name} (${doc.memberName}) expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — renewal recommended.`
      : `${doc.name} (${doc.memberName}) has expired.`
  });
}

async function checkBillAlerts() {
  return checkExpiryAlerts({
    Model: Bill,
    module: 'UtilityDesk',
    dateField: 'dueDate',
    defaultAlertDays: 3,
    extraFilter: { paid: false }, // no point alerting on a bill that's already paid
    pushTitle: '⚡ Bill Due Soon',
    pushUrl: '/utilitydesk',
    buildMessage: (bill, daysLeft) => daysLeft >= 0
      ? `${bill.name} (₹${bill.amount}) is due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      : `${bill.name} (₹${bill.amount}) is overdue.`
  });
}

async function checkPolicyAlerts() {
  return checkExpiryAlerts({
    Model: Policy,
    module: 'PolicyWatch',
    dateField: 'renewalDate',
    defaultAlertDays: 30,
    pushTitle: '📋 Policy Renewal',
    pushUrl: '/policywatch',
    buildMessage: (policy, daysLeft) => daysLeft >= 0
      ? `${policy.name} for ${policy.memberName} renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      : `${policy.name} for ${policy.memberName} has lapsed.`
  });
}

async function checkPantryAlerts() {
  return checkExpiryAlerts({
    Model: PantryItem,
    module: 'PantryIQ',
    dateField: 'expiry',
    defaultAlertDays: 7,
    pushTitle: '🛒 Pantry Item Expiring',
    pushUrl: '/pantryiq',
    buildMessage: (item, daysLeft) => daysLeft >= 0
      ? `${item.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      : `${item.name} has expired.`
  });
}

async function checkApplianceAlerts() {
  return checkExpiryAlerts({
    Model: Appliance,
    module: 'HomeCare',
    dateField: 'warrantyExpiry',
    defaultAlertDays: 30,
    pushTitle: '🛠️ Warranty Expiring',
    pushUrl: '/homecare',
    buildMessage: (appliance, daysLeft) => daysLeft >= 0
      ? `${appliance.name} warranty expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      : `${appliance.name} warranty has expired.`
  });
}

async function runAllAlertChecks() {
  try {
    await checkMedicineAlerts();
    await checkDocumentAlerts();
    await checkBillAlerts();
    await checkPolicyAlerts();
    await checkPantryAlerts();
    await checkApplianceAlerts();
  } catch (error) {
    console.error('[alerts] Error running alert checks:', error);
  }
}

// Everything runs every minute now, because each item has its own alert time
// (and each medicine its own dose times). Each check exits quickly unless an
// item's window is open and its time has been reached, and same-day dedup
// guarantees at most one expiry-type alert per item per day.
function startAlertScheduler() {
  cron.schedule('* * * * *', async () => {
    await checkMedicineDoseReminders();
    await runAllAlertChecks();
  });
  console.log('[alerts] Scheduler started — checking every minute (dose times + per-item alert times).');
}

module.exports = {
  startAlertScheduler,
  checkMedicineAlerts,
  checkMedicineDoseReminders,
  checkDocumentAlerts,
  checkBillAlerts,
  checkPolicyAlerts,
  checkPantryAlerts,
  checkApplianceAlerts,
  runAllAlertChecks
};
