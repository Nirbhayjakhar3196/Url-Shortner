
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
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

