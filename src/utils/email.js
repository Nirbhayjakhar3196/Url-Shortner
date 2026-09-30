
const nodemailer = require("nodemailer");

const getSanitizedCredentials = () => {
    const rawPass = process.env.SMTP_PASSWORD || "";
    const cleanPass = rawPass.replace(/\s+/g, "").trim();
    const user = (process.env.SMTP_USER || "").trim();
    const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const port = Number(process.env.SMTP_PORT) || 465;
    const from = (process.env.SMTP_FROM || user || "noreply@swiftlink.com").trim();

    return { user, pass: cleanPass, host, port, from };
};

const sendOtpEmail = async (email, otp) => {
    const { user, pass, host, port, from } = getSanitizedCredentials();

    if (!user || !pass) {
        throw new Error("SMTP credentials missing in environment variables (SMTP_USER or SMTP_PASSWORD)");
    }

    const mailOptions = {
        from: `"SwiftLink Support" <${from}>`,
        to: email.trim(),
        subject: "Your Password Reset OTP - SwiftLink",
        text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\nIf you did not request this, please ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2ddd1; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #1e2024; margin-bottom: 8px;">Password Reset Code</h2>
                <p style="color: #666; font-size: 14px;">Use the verification code below to reset your SwiftLink account password:</p>
                <div style="background-color: #faf8f4; border: 1px dashed #d4af37; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e2024; font-family: monospace;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 12px;">This OTP will expire in <strong>5 minutes</strong>.</p>
                <p style="color: #aaa; font-size: 11px; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        `
    };

    let lastError = null;

    // Attempt 1: Gmail service
    try {
        const gmailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log("OTP email sent via Gmail service:", info.messageId);
        return info;
    } catch (err) {
        console.warn("Gmail service send failed, trying direct SSL port 465...", err.message);
        lastError = err;
    }

    // Attempt 2: Direct SSL Port 465
    try {
        const directTransporter = nodemailer.createTransport({
            host: host || "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });
        const info = await directTransporter.sendMail(mailOptions);
        console.log("OTP email sent via Direct SSL 465:", info.messageId);
        return info;
    } catch (err) {
        console.error("Direct SSL 465 send failed:", err.message);
        lastError = err;
    }

    throw lastError || new Error("Failed to dispatch OTP email");
};

const verifyEmailConnection = async () => {
    const { user, pass } = getSanitizedCredentials();
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
    await transporter.verify();
    console.log("SMTP connection is verified");
};

module.exports = {
    sendOtpEmail,
    verifyEmailConnection
};

