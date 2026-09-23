const express = require('express');

const {
    register,
    login,
    logout,
    getMe,
    verifyMFA,
    resendMFA,
    addFamilyMember,
    getFamilyMembers
} = require('../controllers/auth.controller');

const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();


// ===============================
// AUTH ROUTES
// ===============================

router.post('/register', register);

router.post('/login', login);

router.post('/verify-mfa', verifyMFA);

router.post('/resend-mfa', resendMFA);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);


// ===============================
// FAMILY MEMBER ROUTES
// ===============================

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