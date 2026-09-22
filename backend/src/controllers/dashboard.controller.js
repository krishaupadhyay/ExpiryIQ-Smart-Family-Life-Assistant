const Medicine = require('../models/medicine.model');
const Document = require('../models/document.model');
const Policy = require('../models/policy.model');
const Bill = require('../models/bill.model');
const PantryItem = require('../models/pantryItem.model');
const Appliance = require('../models/appliance.model');
const Notification = require('../models/notification.model');

const getSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();

    const [medicines, documents, policies, bills, pantryItems, appliances, notifications] = await Promise.all([
      Medicine.find({ userId }),
      Document.find({ userId }),
      Policy.find({ userId }),
      Bill.find({ userId }),
      PantryItem.find({ userId }),
      Appliance.find({ userId }),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(10)
    ]);

    const daysUntil = (d) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);

    const medicinesExpiringSoon = medicines.filter(m => daysUntil(m.expiry) <= 7).length;
    const documentsExpiringSoon = documents.filter(d => d.expiry && daysUntil(d.expiry) <= 30).length;
    const billsUnpaid = bills.filter(b => !b.paid);
    const billsDueAmount = billsUnpaid.reduce((sum, b) => sum + b.amount, 0);
    const policiesRenewingSoon = policies.filter(p => daysUntil(p.renewalDate) <= 30).length;

    const reminders = notifications
      .filter(n => !n.read)
      .slice(0, 6)
      .map(n => ({
        id: n._id,
        text: n.message,
        urgent: n.urgent,
        module: n.module,
        time: n.createdAt
      }));

    const recentActivity = notifications.slice(0, 6).map(n => ({
      text: n.message,
      time: n.createdAt,
      module: n.module
    }));

    return res.json({
      counts: {
        medicines: medicines.length,
        documents: documents.length,
        policies: policies.length,
        bills: bills.length,
        pantryItems: pantryItems.length,
        appliances: appliances.length
      },
      alerts: {
        medicinesExpiringSoon,
        documentsExpiringSoon,
        billsUnpaidCount: billsUnpaid.length,
        billsDueAmount,
        policiesRenewingSoon
      },
      reminders,
      recentActivity
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ message: 'Server error while loading dashboard summary.' });
  }
};

module.exports = { getSummary };
