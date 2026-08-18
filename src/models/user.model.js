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
            default: 'Family Member',
            trim: true
        },

        age: {
            type: Number,
            min: 0
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