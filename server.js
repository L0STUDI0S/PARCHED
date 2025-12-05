import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import webpush from "web-push";

const app = express();
app.use(bodyParser.json());

const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
  "mailto:you@example.com",
  publicVapidKey,
  privateVapidKey
);

// Load or create subscribers.json
const subscribersFile = "subscribers.json";
let subscribers = [];
if (fs.existsSync(subscribersFile)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersFile, "utf8"));
} else {
    fs.writeFileSync(subscribersFile, JSON.stringify([]));
}

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
    const sub = req.body;

    // Check for duplicate subscriptions
    if (!subscribers.find(s => s.endpoint === sub.endpoint)) {
        subscribers.push(sub);
        fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
        console.log("✅ New subscription added:", sub.endpoint);
    } else {
        console.log("ℹ️ Subscription already exists:", sub.endpoint);
    }

    res.sendStatus(201);
});

// Notify endpoint
app.post("/notify", async (req, res) => {
    const payload = JSON.stringify({
        title: req.body.title,
        body: req.body.body,
        icon: req.body.icon
    });

    for (const sub of subscribers) {
        try {
            await webpush.sendNotification(sub, payload);
            console.log("✅ Notification sent to:", sub.endpoint);
        } catch (err) {
            console.error("❌ Failed to send notification:", err.body || err);
        }
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
