const express = require("express");
const db = require("./config/firebase");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Room IoT Backend is running"
    });
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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});