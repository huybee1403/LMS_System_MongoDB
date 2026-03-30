require("dotenv").config();

const env = require("./configs/env");

const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDB = require("./configs/db");
const seedAdmin = require("./seeds/seedAdmin");

const app = express();

/* ========================
   MIDDLEWARE
======================== */
app.use(express.json());
app.use(cookieParser());

/* ========================
   TEST ROUTE
======================== */
app.get("/", (req, res) => {
    res.send("API is running...");
});

/* ========================
   START SERVER
======================== */
const PORT = env.PORT || 8080;

const startServer = async () => {
    try {
        // 1. Connect MongoDB
        await connectDB();

        // 2. Seed admin user
        await seedAdmin();

        // 3. Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
