const { z } = require("zod");

const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
});

const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required")
});

const forgotPassowrdSchema = z.object({

    email : z
            .string()
            .email("Invalid email address"),
})

const verifyOtpSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits")
});

const resetPasswordSchema = z.object({
    resetToken: z
        .string()
        .min(1, "Reset token is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPassowrdSchema,
    verifyOtpSchema,
    resetPasswordSchema
};