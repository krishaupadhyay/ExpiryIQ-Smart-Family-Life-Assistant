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

                <p>Your verification code is:</p>

                <h1 style="letter-spacing: 5px;">
                    ${otp}
                </h1>

                <p>
                    This OTP is valid for 5 minutes.
                </p>

                <p>
                    If you did not request this code, please ignore this email.
                </p>
            </div>
        `
    });
};

module.exports = {
    sendOTPEmail
};