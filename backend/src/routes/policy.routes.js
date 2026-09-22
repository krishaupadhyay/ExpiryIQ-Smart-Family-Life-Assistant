const express = require('express');
const { getPolicies, addPolicy, updatePolicy, deletePolicy } = require('../controllers/policy.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getPolicies);
router.post('/', requireAuth, addPolicy);
router.put('/:id', requireAuth, updatePolicy);
router.delete('/:id', requireAuth, deletePolicy);

module.exports = router;
