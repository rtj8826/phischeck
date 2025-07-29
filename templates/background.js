let phishingLog = [];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "CHECK_URLS") {
        const urls = message.urls;

        urls.forEach(url => {
            fetch("http://54.252.60.21:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: url })
            })
            .then(response => response.json())
            .then(data => {
                if (data.prediction === "Phishing" && data.confidence > 0.7) {
                    if (!phishingLog.includes(url)) {
                        phishingLog.push(url);
                        chrome.storage.local.set({ phishingLog });

                        console.log("📌 URL phishing terdeteksi:", url);

                        // Kirim URL phishing ke content.js
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: "BLOCK_URLS",
                            phishingUrls: [url]
                        });
                    }
                }
            })
            .catch(err => console.error("❌ Gagal memeriksa URL:", err));
        });
    }
});
