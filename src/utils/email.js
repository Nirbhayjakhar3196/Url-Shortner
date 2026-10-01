const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
    timeoutInSeconds: 10,
    maxRetries: 1
});

const verifyEmailConnection = async () => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing");
    }

    if (!process.env.BREVO_FROM_EMAIL) {
        throw new Error("BREVO_FROM_EMAIL is missing");
    }

    console.log("Brevo email service is ready");
};

const sendOtpEmail = async (email, otp) => {
    const response = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            name: process.env.BREVO_FROM_NAME || "URL Shortener",
            email: process.env.BREVO_FROM_EMAIL
        },

        to: [
            {
                email
            }
        ],

        subject: "Your Password Reset OTP",

        textContent: `
Your password reset OTP is: ${otp}

This OTP will expire in 5 minutes.

If you did not request a password reset, please ignore this email.
        `,

        htmlContent: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset</h2>

                <p>Your password reset OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    This OTP will expire in
                    <strong>5 minutes</strong>.
                </p>

                <p>
                    If you did not request a password reset,
                    please ignore this email.
                </p>
            </div>
        `
    });

    console.log("OTP email sent via Brevo:", response.messageId);

    return response;
};

module.exports = {
    sendOtpEmail,
    verifyEmailConnection
};