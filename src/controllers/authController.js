
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const crypto = require("crypto");

const { redisClient } = require("../config/redis");

const { generateOtp, hashValue } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");


const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid =
            await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            message: "User logged in successfully",
            token
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const genericMessage =
            "If an account exists with this email, a password reset OTP has been sent.";

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message: genericMessage
            });
        }

        // Unique cooldown key for this user
        const coolDownKey =
            `password-reset:cooldown:${user._id}`;

        // Check whether cooldown is active
        const coolDownExist =
            await redisClient.exists(coolDownKey);

        if (coolDownExist) {
            return res.status(200).json({
                message: genericMessage
            });
        }

        // Generate OTP
        const otp = generateOtp();

        // Hash OTP before storing it
        const otpHash = hashValue(otp);

        // Unique OTP key for this user
        const otpKey =
            `password-reset:otp:${user._id}`;

        const otpData = JSON.stringify({
            otpHash,
            attempts: 0
        });

        // Store OTP for 5 minutes
        await redisClient.set(
            otpKey,
            otpData,
            {
                EX: 300
            }
        );

        // Create cooldown for 60 seconds
        await redisClient.set(
            coolDownKey,
            "1",
            {
                EX: 60
            }
        );

        // Send actual OTP to user's email
        await sendOtpEmail(user.email, otp);

        return res.status(200).json({
            message: genericMessage
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const verifyOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const otpKey =
            `password-reset:otp:${user._id}`;

        // Get OTP data from Redis
        const storedData =
            await redisClient.get(otpKey);

        if (!storedData) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const data = JSON.parse(storedData);

        // Maximum 5 attempts
        if (data.attempts >= 5) {

            await redisClient.del(otpKey);

            return res.status(429).json({
                message: "Too many OTP attempts"
            });
        }

        // Hash submitted OTP
        const otpHash = hashValue(otp);

        // Compare submitted OTP hash with stored hash
        if (otpHash !== data.otpHash) {

            data.attempts += 1;

            // Update attempts while keeping existing TTL
            await redisClient.set(
                otpKey,
                JSON.stringify(data),
                {
                    KEEPTTL: true
                }
            );

            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        // OTP is correct, so remove it
        await redisClient.del(otpKey);

        // Generate a random reset token
        const resetToken =
            crypto.randomBytes(32).toString("hex");

        // Hash reset token before storing it
        const resetTokenHash =
            hashValue(resetToken);

        const resetKey =
            `password-reset:token:${resetTokenHash}`;

        // Store reset token for 10 minutes
        await redisClient.set(
            resetKey,
            user._id.toString(),
            {
                EX: 600
            }
        );

        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const resetPassword = async (req, res) => {

    try {

        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                message: "Reset token and new password are required"
            });
        }

        // Hash reset token
        const resetTokenHash =
            hashValue(resetToken);

        const resetKey =
            `password-reset:token:${resetTokenHash}`;

        // Get user ID stored against reset token
        const userId =
            await redisClient.get(resetKey);

        if (!userId) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const passwordHash =
            await bcrypt.hash(newPassword, 10);

        // Update user's password
        await User.findByIdAndUpdate(
            userId,
            {
                password: passwordHash
            }
        );

        // Delete reset token so it cannot be reused
        await redisClient.del(resetKey);

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword
};
