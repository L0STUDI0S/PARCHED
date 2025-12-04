import express from "express";
import webpush from "web-push";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(bodyParser.json());

webpush.setVapidDetails(
    "mailto:you@example.com",
    "BKESiJ5NrNR0AFC-ZVoh8n8PRklJEFPEdz1DJrLUyN28lB5T4YDNCR07oI1qtZlJMVXh82hGmxQcWcRaD9SJS3c",
    "ByjaFD3wg8qEkHhDJq2_q-YbFWOAS4LOyJVRDs0VYcc"
);

const subscribers = [];

app.post("/subscribe", (req, res) => {
    subscribers.push(req.body);
    fs.writeFileSync("subscribers.json", JSON.stringify(subscribers));
    res.sendStatus(201);
});


app.post("/notify", async (req, res) => {
    const payload = JSON.stringify({
        title: req.body.title,
        body: req.body.body,
        icon: req.body.icon
    });

    for (const sub of subscribers) {
        await webpush.sendNotification(sub, payload).catch(() => {});
    }

    res.sendStatus(200);
});

app.listen(3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
