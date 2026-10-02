const express = require('express');

const {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/document.controller');

const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getDocuments);
router.post('/', requireAuth, addDocument);
router.put('/:id', requireAuth, updateDocument);
router.delete('/:id', requireAuth, deleteDocument);

module.exports = router;
