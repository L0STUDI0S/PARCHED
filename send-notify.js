import webpush from "web-push";
import fs from "fs";


const publicKey = "BKESiJ5NrNR0AFC-ZVoh8n8PRklJEFPEdz1DJrLUyN28lB5T4YDNCR07oI1qtZlJMVXh82hGmxQcWcRaD9SJS3c";
const privateKey = "ByjaFD3wg8qEkHhDJq2_q-YbFWOAS4LOyJVRDs0VYcc";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicKey,
    privateKey
);


const subscribers = JSON.parse(fs.readFileSync("subscribers.json", "utf8"));

const payload = JSON.stringify({
    title: "Hello from Node.js!",
    body: "This is a test notification",
    icon: "caractor.png"
});

subscribers.forEach(async (sub) => {
    try {
        await webpush.sendNotification(sub, payload);
        console.log("Notification sent!");
    } catch (err) {
        console.error(err);
    }
});
