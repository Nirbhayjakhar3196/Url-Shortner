const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port : Number(process.env.SMTP_PORT),
    secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASSWORD
    }

})

const sendOtpEmail = async(email , otp) => {

    await transporter.sendMail({
        from:process.env.SMTP_FROM,
        to:email,
        subject : "Password reset OTP",
        text : `Your Password reset otp is ${otp}. It expires in 5 minutes.`
    })
}

module.exports = {
    sendOtpEmail
}