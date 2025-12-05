const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            // Register service worker
            const sw = await navigator.serviceWorker.register("./service-worker.js");
            console.log("Service Worker Registered");

            // Subscribe user
            const subscription = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send subscription to server
            const response = await fetch("/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription)
            });

            console.log("Subscribed for Push Notifications, status:", response.status);
        } catch (err) {
            console.error("Error during service worker registration or subscription:", err);
        }
    });
}

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
