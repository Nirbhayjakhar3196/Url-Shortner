const express = require("express");
const cors = require("cors");
const helmet = require("helmet")

const authRoutes = require("./src/routes/authRoutes");
const urlRoutes = require("./src/routes/urlRoutes");

const {redirectUrl, getAnalytics} = require("./src/controllers/urlController")

const app = express();

app.use(helmet());

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        version: "v3-resilient-smtp",
        smtpUserConfigured: Boolean(process.env.SMTP_USER),
        smtpUser: process.env.SMTP_USER || null,
        smtpPassLength: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, "").length : 0,
        mongoConfigured: Boolean(process.env.MONGO_URI),
        redisConfigured: Boolean(process.env.REDIS_URL)
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "URL Shortener API is running"
    }); 
});

app.use("/auth", authRoutes);
app.use("/url", urlRoutes);

app.get("/:shortId", redirectUrl);

module.exports = app;