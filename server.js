import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import webpush from "web-push";

const app = express();
app.use(bodyParser.json());

// Replace with your VAPID keys
const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

// Load or create subscribers.json
let subscribers = [];
if (fs.existsSync("subscribers.json")) {
    subscribers = JSON.parse(fs.readFileSync("subscribers.json", "utf8"));
} else {
    fs.writeFileSync("subscribers.json", JSON.stringify([]));
}

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
    subscribers.push(req.body);
    fs.writeFileSync("subscribers.json", JSON.stringify(subscribers));
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
        } catch (err) {
            console.error(err);
        }
    }

    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
