require("dotenv").config({ path: "../.env" });

const express = require("express");
const path = require("path");
const db = require("./config/firebase");

const authRoutes = require("./routes/authRoutes");
const readingsRoutes = require("./routes/readingsRoutes");
const devicesRoutes = require("./routes/devicesRoutes");

const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingsRoutes);
app.use("/api/devices", devicesRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Room IoT Backend is running"
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

app.get("/api/firebase-test", async (req, res) => {
    try {
        await db.collection("system").doc("test").set({
            message: "Firebase connection working",
            checked_at: new Date()
        });

        res.json({
            success: true,
            message: "Firebase connection working"
        });
    } catch (error) {
        console.error("Firebase test error:", error);

        res.status(500).json({
            success: false,
            message: "Firebase connection failed"
        });
    }
});

app.get("/api/protected-test", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "You accessed a protected route",
        user: req.user
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});