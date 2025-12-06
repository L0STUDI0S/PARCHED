if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const sw = await navigator.serviceWorker.register("/service-worker.js");
            console.log("✅ Service Worker Registered and active");

            const subscription = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            const response = await fetch("/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription)
            });

            console.log("✅ Subscription sent to server, status:", response.status);
        } catch (err) {
            console.error("❌ Error during service worker registration or subscription:", err);
        }
    });
}
