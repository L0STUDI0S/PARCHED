import express from "express";
import fs from "fs";
import webpush from "web-push";
import path from "path";

const app = express();
app.use(express.json());

// Serve static files from the root of the repo
app.use(express.static("PARCHED"));

// VAPID keys
const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";
webpush.setVapidDetails("mailto:you@example.com", publicVapidKey, privateVapidKey);

// subscribers.json path
const subscribersPath = path.join("PARCHED", "subscribers.json");
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
        icon: req.body.icon,
    });

    for (let i = subscribers.length - 1; i >= 0; i--) {
        try {
            await webpush.sendNotification(subscribers[i], payload);
        } catch (err) {
            console.error("Failed notification:", err);
            subscribers.splice(i, 1);
        }
    }

    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
    res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
