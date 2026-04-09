require("dotenv").config();

const env = require("./configs/env");
const app = require("./configs/app");

const connectDB = require("./configs/db");
const seedAdmin = require("./seeds/seedAdmin");
const updateClassStatus = require("./jobs/updateClassStatus");
const notifyTodayClassesOnStartup = require("./services/todayClassNotification.service");

/* ========================
   START SERVER
======================== */
const PORT = env.PORT || 8080;

const startServer = async () => {
    try {
        // 1. Connect MongoDB
        await connectDB();

        // 2. Seed admin
        await seedAdmin();

        // 3. Update class status and send today's notifications
        await updateClassStatus();
        await notifyTodayClassesOnStartup();

        // 4. Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
