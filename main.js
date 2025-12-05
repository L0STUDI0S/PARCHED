const publicVapidKey = "BAgmoSmBrF591eDzhJ-54OZYJBU3gYt9j40ZxqQzTOURlcBiBmUqZHkVD5ja_0Wmp0dan0Q2wrphEO1pYHkzTmI";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            console.log("Registering service worker...");
            const swRegistration = await navigator.serviceWorker.register("./service-worker.js");

            // Wait until the service worker is active
            if (swRegistration.installing) {
                await new Promise(resolve => {
                    swRegistration.installing.addEventListener("statechange", function listener() {
                        if (this.state === "activated") resolve();
                    });
                });
            } else if (swRegistration.waiting) {
                await new Promise(resolve => {
                    swRegistration.waiting.addEventListener("statechange", function listener() {
                        if (this.state === "activated") resolve();
                    });
                });
            } else if (swRegistration.active) {
                // Already active, nothing to wait for
            }

            console.log("✅ Service Worker Registered and active");

            // Create push subscription
            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            console.log("✅ Subscription object created:", subscription);

            // Send subscription to server
            const response = await fetch("/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                console.log("✅ Subscription sent to server, status:", response.status);
            } else {
                console.error("❌ Failed to send subscription to server, status:", response.status);
            }
        } catch (err) {
            console.error("❌ Error during service worker registration or subscription:", err);
        }
    });
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
