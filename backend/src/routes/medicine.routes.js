const express = require('express');
 
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicine.controller');
 
const requireAuth = require('../middleware/auth.middleware');
 
const router = express.Router();
 
router.get('/', requireAuth, getMedicines);
router.post('/', requireAuth, addMedicine);
router.put('/:id', requireAuth, updateMedicine);
router.delete('/:id', requireAuth, deleteMedicine);
 
module.exports = router;