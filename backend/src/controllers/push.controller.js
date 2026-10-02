const webpush = require('web-push');
const PushSubscription = require('../models/pushSubscription.model');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@expiryiq.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ===============================
// GET PUBLIC KEY (frontend needs this to subscribe)
// ===============================

const getPublicKey = (req, res) => {
  return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// ===============================
// SUBSCRIBE
// ===============================

const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Invalid subscription data.' });
    }

    // Upsert — if this exact browser/device already subscribed, just update it
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.userId, endpoint, keys },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: 'Subscribed to browser notifications successfully.' });

  } catch (error) {
    console.error('Push subscribe error:', error);
    return res.status(500).json({ message: 'Server error while subscribing to push notifications.' });
  }
};

// ===============================
// UNSUBSCRIBE
// ===============================

const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'Endpoint is required.' });

    await PushSubscription.findOneAndDelete({ endpoint, userId: req.userId });
    return res.json({ message: 'Unsubscribed successfully.' });

  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return res.status(500).json({ message: 'Server error while unsubscribing.' });
  }
};

// ===============================
// SEND HELPER — used by alertScheduler.js, not exposed as a route
// ===============================

async function sendPushToUser(userId, payload) {
  const subscriptions = await PushSubscription.find({ userId });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
      );
    } catch (error) {
      // 410/404 means the subscription is dead (browser data cleared, uninstalled, etc.) — clean it up
      if (error.statusCode === 410 || error.statusCode === 404) {
        await PushSubscription.findByIdAndDelete(sub._id);
      } else {
        console.error('Push send error:', error.message);
      }
    }
  }
}

module.exports = { getPublicKey, subscribe, unsubscribe, sendPushToUser };
