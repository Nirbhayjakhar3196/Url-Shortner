
const nodemailer = require("nodemailer");

const smtpPass = (process.env.SMTP_PASSWORD || "").replace(/\s+/g, "").trim();
const smtpUser = (process.env.SMTP_USER || "").trim();
const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = Number(process.env.SMTP_PORT) || 465;

const isGmail = smtpHost.includes("gmail") || smtpUser.includes("gmail.com") || smtpUser.includes("@kalvium");

const transporter = isGmail
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    })
    : nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });

const verifyEmailConnection = async () => {
    await transporter.verify();
    console.log("SMTP connection is ready");
};

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"URL Shortener" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Your Password Reset OTP",

        text: `
Your password reset OTP is: ${otp}

This OTP will expire in 5 minutes.

If you did not request a password reset, please ignore this email.
        `,

        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset</h2>

                <p>Your password reset OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in <strong>5 minutes</strong>.</p>

                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        `
    });
};

module.exports = {
    sendOtpEmail,
    verifyEmailConnection
};

