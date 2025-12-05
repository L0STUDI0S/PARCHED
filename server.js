import express from "express";
import fs from "fs";
import path from "path";
import webpush from "web-push";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

const subscribersPath = path.resolve("./subscribers.json");
let subscribers = [];

if (fs.existsSync(subscribersPath)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
} else {
    fs.writeFileSync(subscribersPath, JSON.stringify([]));
}

app.post("/subscribe", (req, res) => {
    subscribers.push(req.body);
    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
    res.sendStatus(201);
});

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
            console.error("Failed to send notification:", err);
            subscribers.splice(i, 1); // remove invalid subscription
        }
    }

    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
