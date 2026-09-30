const express = require("express");

const {
    registerUser,
    loginUser , forgotPassword , verifyOtp , resetPassword
} = require("../controllers/authController");

const validate = require("../middleware/validate")
const rateLimit = require("../middleware/rateLimit");

const {googleLogin , googleCallback , exchangeGoogleCode} = require("../controllers/googleAuthController")

const { registerSchema, loginSchema , forgotPassowrdSchema , verifyOtpSchema , resetPasswordSchema } = require("../validators/authvalidators");

const router = express.Router();

const registerRateLimit = rateLimit({
    capacity : 5,
    refillRate : 5/60,
    keyPrefix: "register",
    getIdentifier: (req) => req.body?.email?.toLowerCase().trim() || req.ip
})

const loginRateLimit = rateLimit({
    capacity : 5,
    refillRate : 5/60,
    keyPrefix: "login",
    getIdentifier: (req) => req.body?.email?.toLowerCase().trim() || req.ip
})

const forgotPasswordRateLimit = rateLimit({
    capacity: 3,
    refillRate: 3 / 600,
    keyPrefix: "forgot-password",
    getIdentifier: (req) => req.body?.email?.toLowerCase().trim() || req.ip
});

const verifyOtpRateLimit = rateLimit({
    capacity: 10,
    refillRate: 10 / 300,
    keyPrefix: "verify-otp",
    getIdentifier: (req) => req.body?.email?.toLowerCase().trim() || req.ip
});

const resetPasswordRateLimit = rateLimit({
    capacity: 5,
    refillRate: 5 / 300,
    keyPrefix: "reset-password",
    getIdentifier: (req) => req.body?.email?.toLowerCase().trim() || req.ip
});

router.post("/register",  registerRateLimit ,validate(registerSchema),registerUser);

router.post("/login",loginRateLimit, validate(loginSchema), loginUser);

router.post("/forgot-password" , forgotPasswordRateLimit, validate(forgotPassowrdSchema) , forgotPassword);

router.post("/verify-otp" ,verifyOtpRateLimit, validate(verifyOtpSchema) , verifyOtp)

router.post("/reset-password" ,resetPasswordRateLimit, validate(resetPasswordSchema) , resetPassword)


router.get("/google",googleLogin)

router.get("/google/callback" , googleCallback)

router.post("/google/exchange" , exchangeGoogleCode)

module.exports = router;