import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import webpush from "web-push";

const app = express();

// Serve frontend files from lowercase 'parched'
app.use(express.static("parched"));

app.use(bodyParser.json());

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

let subscribers = [];
const subscribersFile = "subscribers.json";

if (fs.existsSync(subscribersFile)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersFile, "utf8"));
}

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
    subscribers.push(req.body);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers));
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
