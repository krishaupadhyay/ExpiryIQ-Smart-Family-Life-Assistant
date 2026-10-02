const mongoose = require('mongoose');


// ===============================
// FAMILY MEMBER SCHEMA
// ===============================

const familyMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        relation: {
            type: String,
            required: true,
            enum: [
                'Owner',
                'Father',
                'Mother',
                'Son',
                'Daughter',
                'Wife',
                'Husband',
                'Brother',
                'Sister',
                'Grandfather',
                'Grandmother',
                'Aunt',
                'Uncle',
                'Cousin',
                'Other'
            ]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true
        },

        age: {
            type: Number,
            min: 0,
            max: 120
        },

        avatar: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);


// ===============================
// USER SCHEMA
// ===============================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        // ===============================
        // UNIQUE EMAIL
        // ===============================

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: false,
            trim: true
        },

        // ===============================
        // PASSWORD
        // ===============================

        password: {
            type: String,
            required: true
        },

        // ===============================
        // LOGIN SECURITY
        // ===============================

        failedLoginAttempts: {
            type: Number,
            default: 0
        },

        lockUntil: {
            type: Date,
            default: null
        },

        // ===============================
        // MFA / OTP
        // ===============================

        emailOtp: {
            type: String,
            default: null
        },

        otpExpiresAt: {
            type: Date,
            default: null
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        isPhoneVerified: {
            type: Boolean,
            default: false
        },

        // ===============================
        // PASSWORD RESET
        // ===============================

        resetPasswordToken: {
            type: String,
            default: null
        },

        resetPasswordExpires: {
            type: Date,
            default: null
        },

        // ===============================
        // FAMILY MEMBERS
        // ===============================

        familyMembers: {
            type: [familyMemberSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


// ===============================
// EMAIL UNIQUE INDEX
// ===============================

userSchema.index(
    { email: 1 },
    { unique: true }
);


// ===============================
// EXPORT MODEL
// ===============================

module.exports = mongoose.model('User', userSchema);