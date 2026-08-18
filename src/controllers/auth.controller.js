const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


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
// REGISTER
// ===============================

const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.'
            });
        }

        // Normalize email
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
        // CREATE ACCOUNT
        // ===============================

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,

            // Owner automatically becomes first family member
            familyMembers: [
                {
                    name: name.trim(),
                    relation: 'Owner'
                }
            ]
        });


        // ===============================
        // CREATE JWT
        // ===============================

        const token = createToken(user._id);


        // ===============================
        // SET COOKIE
        // ===============================

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        // ===============================
        // RESPONSE
        // ===============================

        return res.status(201).json({
            message: 'Account created successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error('Register error:', error);

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    'An account with this email already exists. Please use a different email address or login.'
            });
        }

        return res.status(500).json({
            message: 'Server error during registration.'
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
                message: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: 'Incorrect email or password.'
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
                user.lockUntil.getTime() - Date.now();

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
        // SUCCESSFUL LOGIN
        // ===============================

        user.failedLoginAttempts = 0;
        user.lockUntil = null;

        await user.save();

        const token = createToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Server error during login.'
        });
    }
};


// ===============================
// GET CURRENT USER
// ===============================

const getMe = async (req, res) => {
    try {

        const user = await User.findById(req.userId)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.json({
            user
        });

    } catch (error) {

        console.error('GetMe error:', error);

        return res.status(500).json({
            message: 'Server error.'
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
        message: 'Logged out successfully.'
    });
};


// ===============================
// ADD FAMILY MEMBER
// ===============================

const addFamilyMember = async (req, res) => {

    try {

        const { name, relation, age } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Family member name is required.'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        user.familyMembers.push({
            name: name.trim(),
            relation: relation || 'Family Member',
            age: age || undefined
        });

        await user.save();

        return res.status(201).json({
            message: 'Family member added successfully.',
            familyMembers: user.familyMembers
        });

    } catch (error) {

        console.error('Add family member error:', error);

        return res.status(500).json({
            message: 'Server error.'
        });
    }
};


// ===============================
// GET FAMILY MEMBERS
// ===============================

const getFamilyMembers = async (req, res) => {

    try {

        const user = await User.findById(req.userId)
            .select('familyMembers');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.json({
            familyMembers: user.familyMembers
        });

    } catch (error) {

        console.error('Get family members error:', error);

        return res.status(500).json({
            message: 'Server error.'
        });
    }
};


module.exports = {
    register,
    login,
    logout,
    getMe,
    addFamilyMember,
    getFamilyMembers
};