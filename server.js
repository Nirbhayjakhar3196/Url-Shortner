const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const app = require("./app");

connectDB();
connectRedis();

const PORT = process.env.PORT || 3000;

app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server is running at ${PORT}`);
});