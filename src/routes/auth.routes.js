const express = require('express');

const {
    register,
    login,
    logout,
    getMe,
    addFamilyMember,
    getFamilyMembers
} = require('../controllers/auth.controller');

const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();


// Authentication
router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);


// Family profiles
router.get(
    '/family-members',
    requireAuth,
    getFamilyMembers
);

router.post(
    '/family-members',
    requireAuth,
    addFamilyMember
);


module.exports = router;