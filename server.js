import http from "http";
import fs from "fs";
import webpush from "web-push";
import { URL } from "url";

// VAPID keys
const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";
const privateVapidKey = "whKH9NrcmO89SS2L-s8i9CeyfB46Kps_vo-tHAE29sk";

webpush.setVapidDetails(
    "mailto:you@example.com",
    publicVapidKey,
    privateVapidKey
);

// Load or create subscribers
const subscribersPath = "./subscribers.json";
let subscribers = [];
if (fs.existsSync(subscribersPath)) {
    subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
} else {
    fs.writeFileSync(subscribersPath, JSON.stringify([]));
}

// Minimal JSON parsing helper
function parseJSON(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (req.method === "POST" && url.pathname === "/subscribe") {
        try {
            const data = await parseJSON(req);
            subscribers.push(data);
            fs.writeFileSync(subscribersPath, JSON.stringify(subscribers));
            res.writeHead(201, {"Content-Type": "application/json"});
            res.end(JSON.stringify({ success: true }));
        } catch {
            res.writeHead(400);
            res.end("Invalid JSON");
        }
    } else if (req.method === "POST" && url.pathname === "/notify") {
        try {
            const data = await parseJSON(req);
            const payload = JSON.stringify({
                title: data.title,
                body: data.body,
                icon: data.icon
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
            res.writeHead(200);
            res.end("Notifications sent");
        } catch {
            res.writeHead(400);
            res.end("Invalid JSON");
        }
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
