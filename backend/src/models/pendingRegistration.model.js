const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

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

        password: {
            type: String,
            required: true
        },

        otp: {
            type: String,
            required: true
        },

        otpExpiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Automatically remove pending registrations
// after 30 minutes
pendingRegistrationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 1800 }
);

module.exports = mongoose.model(
    'PendingRegistration',
    pendingRegistrationSchema
);