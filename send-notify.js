import webpush from "web-push";
import fs from "fs";

const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

let subscribers = [];
if (fs.existsSync("subscribers.json")) {
    subscribers = JSON.parse(fs.readFileSync("subscribers.json", "utf8"));
}

const payload = JSON.stringify({
    title: "Hello!",
    body: "Test notification from terminal",
    icon: "Carator.png"
});

subscribers.forEach(async (sub) => {
    try {
        await webpush.sendNotification(sub, payload);
        console.log("Notification sent!");
    } catch (err) {
        console.error(err);
    }
});
