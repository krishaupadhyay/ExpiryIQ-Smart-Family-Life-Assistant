const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"ExpiryIQ" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ExpiryIQ - Your Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>ExpiryIQ Account Verification</h2>

                <p>Your 6-digit verification code is:</p>

                <h1 style="letter-spacing: 5px;">${otp}</h1>

                <p>This OTP is valid for 5 minutes.</p>

                <p>
                    If you did not request this code,
                    please ignore this email.
                </p>
            </div>
        `
    });

    console.log(`📧 OTP sent successfully to ${email}`);
};

const sendResetPasswordEmail = async (to, resetUrl) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Reset your ExpiryIQ password',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
                <h2>Reset your password</h2>
                <p>We received a request to reset your ExpiryIQ password.
                   This link is valid for <b>15 minutes</b>.</p>
                <p>
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 20px;background:#0D9488;
                              color:#fff;text-decoration:none;border-radius:8px">
                        Reset Password
                    </a>
                </p>
                <p style="color:#6B7280;font-size:12px">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
        `
    });
};

module.exports = { sendOTPEmail, sendResetPasswordEmail };

// add to your existing exports:
module.exports = { sendOTPEmail, sendResetPasswordEmail };

