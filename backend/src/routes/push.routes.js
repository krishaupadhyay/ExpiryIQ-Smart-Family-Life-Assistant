const express = require('express');
const { getPublicKey, subscribe, unsubscribe } = require('../controllers/push.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/public-key', getPublicKey); // no auth needed — it's public by design
router.post('/subscribe', requireAuth, subscribe);
router.post('/unsubscribe', requireAuth, unsubscribe);

module.exports = router;
