const express = require("express");

const {
    registerUser,
    loginUser , forgotPassword , verifyOtp , resetPassword
} = require("../controllers/authController");

const validate = require("../middleware/validate")

const { registerSchema, loginSchema , forgotPassowrdSchema , verifyOtpSchema , resetPasswordSchema } = require("../validators/authvalidators");

const router = express.Router();

router.post("/register",  validate(registerSchema),registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.post("/forgot-password" , validate(forgotPassowrdSchema) , forgotPassword);

router.post("/verify-otp" , validate(verifyOtpSchema) , verifyOtp)

router.post("/reset-password" , validate(resetPasswordSchema) , resetPassword)


module.exports = router;