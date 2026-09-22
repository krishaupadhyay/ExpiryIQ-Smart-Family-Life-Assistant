const express = require('express');
const { getItems, addItem, updateItem, deleteItem } = require('../controllers/pantryItem.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getItems);
router.post('/', requireAuth, addItem);
router.put('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

module.exports = router;
