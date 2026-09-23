const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendOTPSMS = async (phone, otp) => {
    await client.messages.create({
        body: `ExpiryIQ verification code: ${otp}. This OTP is valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    });
};

module.exports = {
    sendOTPSMS
};