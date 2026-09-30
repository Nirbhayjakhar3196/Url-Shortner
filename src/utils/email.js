const nodemailer = require('nodemailer');

const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;

    if (host.includes('gmail')) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendOtpEmail = async (email, otp) => {
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
        from: `"URL Shortener Support" <${fromAddress}>`,
        to: email,
        subject: "Password Reset OTP - URL Shortener",
        text: `Your password reset OTP is ${otp}. It will expire in 5 minutes. If you did not request this, please ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
                <h2 style="color: #333;">Password Reset OTP</h2>
                <p>You requested a password reset for your URL Shortener account.</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #d97706; padding: 15px 0; text-align: center; background: #fef3c7; border-radius: 6px; margin: 15px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 13px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            </div>
        `
    });
};

module.exports = {
    sendOtpEmail
};