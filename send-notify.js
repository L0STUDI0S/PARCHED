import webpush from "web-push";
import fs from "fs";

const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

const subscribersPath = "./subscribers.json";
let subscribers = [];
if (fs.existsSync(subscribersPath)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
    console.log(`✅ Found ${subscribers.length} subscribers`);
} else {
    console.log("⚠️ No subscribers found");
}

const payload = JSON.stringify({
    title: "Hello!",
    body: "Test notification from terminal",
    icon: "Carator.png"
});

(async () => {
    for (const sub of subscribers) {
        try {
            await webpush.sendNotification(sub, payload);
            console.log("✅ Notification sent to subscriber!");
        } catch (err) {
            console.error("❌ Failed notification:", err.body || err);
        }
    }
})();
