import express from "express";
import fs from "fs";
import path from "path";
import webpush from "web-push";

const app = express();
app.use(express.json());

// Serve static files (index.html, main.js, service-worker.js)
app.use(express.static(path.join(process.cwd(), "PARCHED")));

// VAPID keys
const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

// Load or create subscribers.json
const subscribersPath = path.join(process.cwd(), "PARCHED", "subscribers.json");
let subscribers = [];
if (fs.existsSync(subscribersPath)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
} else {
    fs.writeFileSync(subscribersPath, JSON.stringify([]));
}

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
    subscribers.push(req.body);
    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
    res.sendStatus(201);
});

// Notify endpoint
app.post("/notify", async (req, res) => {
    const payload = JSON.stringify({
        title: req.body.title,
        body: req.body.body,
        icon: req.body.icon
    });

    for (let i = subscribers.length - 1; i >= 0; i--) {
        try {
            await webpush.sendNotification(subscribers[i], payload);
        } catch (err) {
            console.error("Failed notification:", err);
            subscribers.splice(i, 1); // Remove invalid subscriptions
        }
    }

    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
    res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
