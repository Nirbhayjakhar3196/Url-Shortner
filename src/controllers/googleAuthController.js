
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const {OAuth2Client} = require("google-auth-library")

const User = require("../models/User")

const {redisClient} = require("../config/redis")

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile"
]

const hashValue = (value) =>{
    return crypto 
        .createHash("sha256")
        .update(value)
        .digest("hex")
}

const googleLogin = async(req, res) => {

    try{
        const state = crypto
            .randomBytes(32)
            .toString("hex");

        const stateHash = hashValue(state)

        await redisClient.set(
            `oauth:state:${stateHash}`,
            "1",
            {
                EX:600
            }
        )

        const authorizationUrl = googleClient.generateAuthUrl({
            access_type : "online",
            scope:GOOGLE_SCOPES,
            state,
            prompt : "select_account"
        })

        res.redirect(authorizationUrl);
    }catch(error){
        console.log("Google login error:", error);

        res.status(500).json({
            message: "Unable to start Google login"
        });
    }

}

const googleCallback = async(req , res) => {

    try {
        
        const {code  , state , error} = req.query;

        if(error){
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=google_login_failed`
            );
        }

        if (!code || !state) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=invalid_google_response`
            );
        }

        const stateHash = hashValue(state);

        const storedState = await redisClient.getDel(
            `oauth:state:${stateHash}`
        )

        if (!storedState) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=invalid_state`
            );
        }

        const { tokens } = await googleClient.getToken(code);

        if (!tokens.id_token) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=missing_google_identity`
            );
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {sub , email , name , email_verified} = payload;

        if (!email || !email_verified || !sub) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/login?error=invalid_google_account`
            );
        }

        let user = await User.findOne({
            googleId : sub
        });

        if (!user) {
            user = await User.findOne({
                email: email.toLowerCase()
            });

            if (user) {
                user.googleId = sub;
                await user.save();
            }
        }

        if (!user) {
            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                googleId: sub
            });
        }

        const handoffCode = crypto
            .randomBytes(32)
            .toString("hex");

        const handoffCodeHash = hashValue(handoffCode);

        await redisClient.set(
            `oauth:exchange:${handoffCodeHash}`,
            user._id.toString(),
            {
                EX: 60
            }
        );

        res.redirect(
            `${process.env.FRONTEND_URL}/oauth/callback?code=${handoffCode}`
        );

    } catch (error) {
        console.log("Google callback error:", error);

        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=google_login_failed`
        );
    }
}

const exchangeGoogleCode = async(req , res) => {

    try {
        
        const {code} = req.body;

        if(!code){
            return res.status(400).json({
                message : "Google exchange code is required"
            });
        }

        const codeHash = hashValue(code);

        const userId = await redisClient.getDel(
            `oauth:exchange:${codeHash}`
        );

        if (!userId) {
            return res.status(401).json({
                message: "Invalid or expired Google exchange code"
            });
        }

        const user = await User.findById(userId);

        const token = jwt.sign(
            {
                id: userId,
                userId: userId,
                name: user ? user.name : "Google User",
                email: user ? user.email : ""
            },
            process.env.JWT_SECRET,
            {
                expiresIn : "1d"
            }
        );

        res.status(200).json({
            message : "Google login successful",
            token
        });

    } catch (error) {
        console.log("Google exchange error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    googleLogin,
    googleCallback,
    exchangeGoogleCode
};