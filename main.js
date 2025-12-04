Notification.requestPermission().then(async permission => {
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.register("service-worker.js");
    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BKESiJ5NrNR0AFC-ZVoh8n8PRklJEFPEdz1DJrLUyN28lB5T4YDNCR07oI1qtZlJMVXh82hGmxQcWcRaD9SJS3c"
    });

    await fetch("http://localhost:3000/subscribe", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: { "Content-Type": "application/json" }
    });
});
