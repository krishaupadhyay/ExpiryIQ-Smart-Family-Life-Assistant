const express = require('express');
const { getBills, addBill, updateBill, deleteBill } = require('../controllers/bill.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getBills);
router.post('/', requireAuth, addBill);
router.put('/:id', requireAuth, updateBill);
router.delete('/:id', requireAuth, deleteBill);

module.exports = router;
