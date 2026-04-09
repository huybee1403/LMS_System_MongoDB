const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const env = require("./env");

const app = express();

/* ========================
   MIDDLEWARE
======================== */
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

/* ========================
   ROUTES
======================== */
// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

const userRoutes = require("../routes/user.routes");
const authRoutes = require("../routes/auth.routes");
const classRoutes = require("../routes/class.routes");
const attendanceRoutes = require("../routes/attendance.routes");
const sessionRoutes = require("../routes/session.routes");
const notificationRoutes = require("../routes/notification.routes");
const teacherSalaryRoutes = require("../routes/teacherSalary.routes");

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teacher-salaries", teacherSalaryRoutes);

/* ========================
   EXPORT APP
======================== */
module.exports = app;
