const express = require('express');
const { chat } = require('../controllers/ai.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/chat', requireAuth, chat);

module.exports = router;
