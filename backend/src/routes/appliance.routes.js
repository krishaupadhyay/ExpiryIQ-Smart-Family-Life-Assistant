const express = require('express');
const { getAppliances, addAppliance, updateAppliance, deleteAppliance } = require('../controllers/appliance.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getAppliances);
router.post('/', requireAuth, addAppliance);
router.put('/:id', requireAuth, updateAppliance);
router.delete('/:id', requireAuth, deleteAppliance);

module.exports = router;
