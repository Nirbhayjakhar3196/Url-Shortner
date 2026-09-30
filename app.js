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
        message: "ok"
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