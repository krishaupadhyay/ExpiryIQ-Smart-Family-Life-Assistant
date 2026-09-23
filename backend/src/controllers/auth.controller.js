const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const generateOTP = require('../utils/otp');
const { sendOTPEmail } = require('../config/mailer.js');


// ===============================
// CREATE JWT
// ===============================

const createToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};


// ===============================
// SET AUTH COOKIE
// ===============================

const setAuthCookie = (res, userId) => {

    const token = createToken(userId);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};


// ===============================
// REGISTER
// ===============================

const register = async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;


        // ===============================
        // REQUIRED FIELDS
        // ===============================

        if (!name || !email || !phone || !password) {

            return res.status(400).json({
                message: 'Name, email, phone and password are required.'
            });
        }


        // ===============================
        // NORMALIZE EMAIL
        // ===============================

        const normalizedEmail = email.toLowerCase().trim();


        // ===============================
        // EMAIL VALIDATION
        // ===============================

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {

            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }


        // ===============================
        // PHONE VALIDATION
        // ===============================

        const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

        if (!phoneRegex.test(phone.trim())) {

            return res.status(400).json({
                message: 'Please enter a valid phone number.'
            });
        }


        // ===============================
        // PASSWORD VALIDATION
        // ===============================

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(password)) {

            return res.status(400).json({
                message:
                    'Password must be at least 8 characters and contain one uppercase letter, one lowercase letter and one digit.'
            });
        }


        // ===============================
        // CHECK DUPLICATE EMAIL
        // ===============================

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {

            return res.status(409).json({
                message:
                    'An account with this email already exists. Please use a different email address or login.'
            });
        }


        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword = await bcrypt.hash(password, 12);


        // ===============================
        // GENERATE OTP
        // ===============================

        const otp = generateOTP();

        const otpExpiresAt =
            new Date(Date.now() + 5 * 60 * 1000);


        // ===============================
        // CREATE OWNER ACCOUNT
        // ===============================

        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            phone: phone.trim(),

            password: hashedPassword,

            emailOtp: otp,

            otpExpiresAt: otpExpiresAt,

            isEmailVerified: false,

            familyMembers: [
                {
                    name: name.trim(),
                    relation: 'Owner'
                }
            ]
        });


        // ===============================
        // SEND OTP
        // ===============================

        await sendOTPEmail(
            normalizedEmail,
            otp
        );


        // IMPORTANT:
        // DO NOT CREATE JWT HERE


        return res.status(201).json({

            message:
                'Account created. Please verify the OTP sent to your email.',

            mfaRequired: true,

            userId: user._id

        });


    } catch (error) {

        console.error(
            'Register error:',
            error
        );

        if (error.code === 11000) {

            return res.status(409).json({
                message:
                    'An account with this email already exists.'
            });
        }

        return res.status(500).json({
            message:
                'Server error during registration.'
        });
    }
};


// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    'Email and password are required.'
            });
        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ===============================
        // FIND USER
        // ===============================

        const user = await User.findOne({
            email: normalizedEmail
        });


        if (!user) {

            return res.status(401).json({
                message:
                    'Incorrect email or password.'
            });
        }


        // ===============================
        // CHECK ACCOUNT LOCK
        // ===============================

        if (
            user.lockUntil &&
            user.lockUntil > new Date()
        ) {

            const remainingTime =
                user.lockUntil.getTime() -
                Date.now();

            const remainingHours =
                Math.ceil(
                    remainingTime /
                    (1000 * 60 * 60)
                );

            return res.status(423).json({
                message:
                    `Account temporarily locked. Try again in approximately ${remainingHours} hour(s).`
            });
        }


        // ===============================
        // AUTO UNLOCK
        // ===============================

        if (
            user.lockUntil &&
            user.lockUntil <= new Date()
        ) {

            user.failedLoginAttempts = 0;

            user.lockUntil = null;

            await user.save();
        }


        // ===============================
        // CHECK PASSWORD
        // ===============================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        // ===============================
        // WRONG PASSWORD
        // ===============================

        if (!passwordMatch) {

            user.failedLoginAttempts += 1;


            if (user.failedLoginAttempts >= 5) {

                user.lockUntil =
                    new Date(
                        Date.now() +
                        2 * 24 * 60 * 60 * 1000
                    );

                await user.save();

                return res.status(423).json({
                    message:
                        'Too many failed login attempts. Your account has been locked for 2 days.'
                });
            }


            await user.save();


            const remainingAttempts =
                5 - user.failedLoginAttempts;


            return res.status(401).json({

                message:
                    `Incorrect email or password. ${remainingAttempts} attempt(s) remaining.`
            });
        }


        // ===============================
        // PASSWORD CORRECT
        // ===============================

        user.failedLoginAttempts = 0;

        user.lockUntil = null;


        // ===============================
        // GENERATE LOGIN OTP
        // ===============================

        const otp = generateOTP();

        user.emailOtp = otp;

        user.otpExpiresAt =
            new Date(
                Date.now() +
                5 * 60 * 1000
            );


        await user.save();


        // ===============================
        // SEND LOGIN OTP
        // ===============================

        await sendOTPEmail(
            user.email,
            otp
        );


        // IMPORTANT:
        // DO NOT CREATE JWT YET


        return res.json({

            message:
                'Password verified. OTP sent to your email.',

            mfaRequired: true,

            userId: user._id

        });


    } catch (error) {

        console.error(
            'Login error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error during login.'
        });
    }
};


// ===============================
// VERIFY MFA
// ===============================

const verifyMFA = async (req, res) => {

    try {

        const { userId, otp } = req.body;


        if (!userId || !otp) {

            return res.status(400).json({
                message:
                    'User ID and OTP are required.'
            });
        }


        // ===============================
        // FIND USER
        // ===============================

        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({
                message:
                    'User not found.'
            });
        }


        // ===============================
        // CHECK OTP
        // ===============================

        if (!user.emailOtp) {

            return res.status(400).json({
                message:
                    'No OTP is active. Please request a new OTP.'
            });
        }


        // ===============================
        // CHECK OTP EXPIRY
        // ===============================

        if (
            !user.otpExpiresAt ||
            user.otpExpiresAt < new Date()
        ) {

            user.emailOtp = null;

            user.otpExpiresAt = null;

            await user.save();

            return res.status(400).json({
                message:
                    'OTP has expired. Please request a new OTP.'
            });
        }


        // ===============================
        // CHECK OTP VALUE
        // ===============================

        if (user.emailOtp !== otp) {

            return res.status(401).json({
                message:
                    'Invalid OTP. Please try again.'
            });
        }


        // ===============================
        // OTP SUCCESS
        // ===============================

        user.emailOtp = null;

        user.otpExpiresAt = null;

        user.isEmailVerified = true;

        await user.save();


        // ===============================
        // NOW CREATE JWT
        // ===============================

        setAuthCookie(
            res,
            user._id
        );


        return res.json({

            message:
                'MFA verification successful.',

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });


    } catch (error) {

        console.error(
            'Verify MFA error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error during MFA verification.'
        });
    }
};


// ===============================
// RESEND MFA OTP
// ===============================

const resendMFA = async (req, res) => {

    try {

        const { userId } = req.body;


        if (!userId) {

            return res.status(400).json({
                message:
                    'User ID is required.'
            });
        }


        const user =
            await User.findById(userId);


        if (!user) {

            return res.status(404).json({
                message:
                    'User not found.'
            });
        }


        // ===============================
        // GENERATE NEW OTP
        // ===============================

        const otp = generateOTP();


        user.emailOtp = otp;

        user.otpExpiresAt =
            new Date(
                Date.now() +
                5 * 60 * 1000
            );


        await user.save();


        // ===============================
        // SEND EMAIL
        // ===============================

        await sendOTPEmail(
            user.email,
            otp
        );


        return res.json({

            message:
                'A new OTP has been sent to your email.'
        });


    } catch (error) {

        console.error(
            'Resend MFA error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while resending OTP.'
        });
    }
};


// ===============================
// GET CURRENT USER
// ===============================

const getMe = async (req, res) => {

    try {

        const user =
            await User.findById(req.userId)
                .select('-password -emailOtp -otpExpiresAt');

        if (!user) {

            return res.status(404).json({
                message:
                    'User not found.'
            });
        }

        return res.json({
            user
        });

    } catch (error) {

        console.error(
            'GetMe error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error.'
        });
    }
};


// ===============================
// LOGOUT
// ===============================

const logout = async (req, res) => {

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return res.json({
        message:
            'Logged out successfully.'
    });
};


// ===============================
// ADD FAMILY MEMBER
// ===============================

const addFamilyMember = async (req, res) => {

    try {

        const {
            name,
            relation,
            age,
            email,
            phone
        } = req.body;


        if (!name) {

            return res.status(400).json({
                message:
                    'Family member name is required.'
            });
        }


        const user =
            await User.findById(req.userId);


        if (!user) {

            return res.status(404).json({
                message:
                    'User not found.'
            });
        }


        user.familyMembers.push({

            name: name.trim(),

            relation:
                relation || 'Other',

            age:
                age || undefined,

            email:
                email
                    ? email.trim().toLowerCase()
                    : undefined,

            phone:
                phone
                    ? phone.trim()
                    : undefined
        });


        await user.save();


        return res.status(201).json({

            message:
                'Family member added successfully.',

            familyMembers:
                user.familyMembers
        });


    } catch (error) {

        console.error(
            'Add family member error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error.'
        });
    }
};


// ===============================
// GET FAMILY MEMBERS
// ===============================

const getFamilyMembers = async (req, res) => {

    try {

        const user =
            await User.findById(req.userId)
                .select('familyMembers');


        if (!user) {

            return res.status(404).json({
                message:
                    'User not found.'
            });
        }


        return res.json({
            familyMembers:
                user.familyMembers
        });


    } catch (error) {

        console.error(
            'Get family members error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error.'
        });
    }
};


// ===============================
// EXPORT
// ===============================

module.exports = {

    register,
    login,
    verifyMFA,
    resendMFA,
    logout,
    getMe,
    addFamilyMember,
    getFamilyMembers

};