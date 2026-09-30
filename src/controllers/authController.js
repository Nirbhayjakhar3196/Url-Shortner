
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { redisClient } = require("../config/redis");
const { sendOtpEmail } = require("../utils/email");
const {
    generateOtp,
    hashValue,
    generateResetToken
} = require("../utils/otp");


const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
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

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

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

        /*
         * Always return the same response.
         * This prevents attackers from discovering
         * whether an email exists in our database.
         */
        const genericResponse = {
            message: "If an account exists with this email, an OTP has been sent."
        };

        if (!email || typeof email !== "string") {
            return res.status(200).json(genericResponse);
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        /*
         * One OTP request per 60 seconds.
         */
        const cooldownKey = `password-reset:cooldown:${user._id}`;

        const cooldownExists = await redisClient.exists(cooldownKey);

        if (cooldownExists) {
            return res.status(200).json(genericResponse);
        }

        /*
         * Generate a new OTP.
         */
        const otp = generateOtp();

        /*
         * Never store the plain OTP.
         */
        const otpHash = hashValue(otp);

        const otpKey = `password-reset:otp:${user._id}`;

        const otpData = {
            otpHash,
            attempts: 0
        };

        /*
         * OTP is valid for 5 minutes.
         */
        await redisClient.set(
            otpKey,
            JSON.stringify(otpData),
            {
                EX: 300
            }
        );

        /*
         * Prevent repeated requests for 60 seconds.
         */
        await redisClient.set(
            cooldownKey,
            "1",
            {
                EX: 60
            }
        );

        /*
         * Send the actual OTP.
         */
        try {
            await sendOtpEmail(user.email, otp);
        } catch (emailError) {
            /*
             * Email failed.
             * Remove OTP and cooldown so the user
             * can try again.
             */
            await redisClient.del(otpKey);
            await redisClient.del(cooldownKey);

            console.error("OTP email failed:", emailError.message);

            return res.status(500).json({
                message: "Unable to send OTP. Please try again."
            });
        }

        return res.status(200).json(genericResponse);

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Something went wrong."
        });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        /*
         * OTP should be exactly 6 digits.
         */
        const cleanOtp = String(otp)
            .trim()
            .replace(/\s+/g, "");

        if (!/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                message: "OTP must be 6 digits."
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid OTP."
            });
        }

        const otpKey = `password-reset:otp:${user._id}`;

        const storedOtp = await redisClient.get(otpKey);

        if (!storedOtp) {
            return res.status(400).json({
                message: "OTP has expired or is invalid."
            });
        }

        const otpData = JSON.parse(storedOtp);

        /*
         * Maximum 5 attempts.
         */
        if (otpData.attempts >= 5) {
            await redisClient.del(otpKey);

            return res.status(400).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        /*
         * IMPORTANT:
         * Hash the CLEANED OTP.
         */
        const submittedOtpHash = hashValue(cleanOtp);

        /*
         * OTP is wrong.
         */
        if (submittedOtpHash !== otpData.otpHash) {

            otpData.attempts += 1;

            /*
             * Keep the original expiry time.
             */
            await redisClient.set(
                otpKey,
                JSON.stringify(otpData),
                {
                    KEEPTTL: true
                }
            );

            return res.status(400).json({
                message: "Invalid OTP."
            });
        }

        /*
         * Correct OTP.
         *
         * OTP can never be reused.
         */
        await redisClient.del(otpKey);

        /*
         * Generate temporary reset token.
         */
        const resetToken = generateResetToken();

        const resetTokenHash = hashValue(resetToken);

        const resetTokenKey =
            `password-reset:token:${resetTokenHash}`;

        /*
         * Reset token is valid for 10 minutes.
         */
        await redisClient.set(
            resetTokenKey,
            user._id.toString(),
            {
                EX: 600
            }
        );

        return res.status(200).json({
            message: "OTP verified successfully.",
            resetToken
        });

    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            message: "Something went wrong."
        });
    }
};


const resetPassword = async (req, res) => {
    try {
        const {
            resetToken,
            newPassword
        } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                message: "Reset token and new password are required."
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        /*
         * Hash reset token to find it in Redis.
         */
        const resetTokenHash = hashValue(resetToken);

        const resetTokenKey =
            `password-reset:token:${resetTokenHash}`;

        const userId = await redisClient.get(resetTokenKey);

        if (!userId) {
            return res.status(400).json({
                message: "Reset token is invalid or expired."
            });
        }

        /*
         * Hash the new password.
         */
        const passwordHash = await bcrypt.hash(
            newPassword,
            12
        );

        /*
         * Update password.
         */
        await User.findByIdAndUpdate(
            userId,
            {
                password: passwordHash
            }
        );

        /*
         * Reset token is one-time use.
         */
        await redisClient.del(resetTokenKey);

        return res.status(200).json({
            message: "Password reset successfully."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Something went wrong."
        });
    }
};


module.exports = {
    // KEEP YOUR EXISTING FUNCTIONS HERE
    forgotPassword,
    verifyOtp,
    resetPassword
};




module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword
};
