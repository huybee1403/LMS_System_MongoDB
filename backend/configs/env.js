require("dotenv").config();

const env = {
    PORT: process.env.PORT || 8080,

    MONGO_URI: process.env.MONGO_URI,

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",

    NODE_ENV: process.env.NODE_ENV || "development",
};

// 🔥 Validate biến môi trường bắt buộc
const requiredEnv = ["MONGO_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];

requiredEnv.forEach((key) => {
    if (!env[key]) {
        console.error(`❌ Missing environment variable: ${key}`);
        process.exit(1);
    }
});

// 🔥 Optional: cảnh báo nếu dùng secret yếu (dev thôi)
if (env.NODE_ENV === "production") {
    if (env.ACCESS_TOKEN_SECRET.length < 16) {
        console.warn("⚠️ ACCESS_TOKEN_SECRET is too short for production!");
    }
}

module.exports = env;
