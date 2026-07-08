const mongoose = require("mongoose");
const fs = require("fs");

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI, {
        tlsCAFile: process.env.CA_FILE,
    });

    console.log("✅ Connected to Amazon DocumentDB");
}

module.exports = connectDB;
