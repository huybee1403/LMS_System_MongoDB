const mongoose = require("mongoose");
const fs = require("fs");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsCAFile: "/home/ec2-user/LMS_System_MongoDB/backend/certs/global-bundle.pem",
            retryWrites: false,
        });

        console.log("✅ DocumentDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
