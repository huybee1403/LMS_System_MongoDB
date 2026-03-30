const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

module.exports = app;
