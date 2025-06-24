// Inisialisasi array untuk menyimpan URL phishing
let phishingLog = [];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "CHECK_URLS") {
        const urls = message.urls;

        urls.forEach(url => {
            fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
            })
            .then(response => response.json())
            .then(data => {
                if (data.prediction === "Phishing" && data.confidence > 0.7) {
                    // Tambahkan ke log phishing
                    phishingLog.push(url);
                    chrome.storage.local.set({ phishingLog });

                    // Debug log di konsol
                    console.log("📌 URL phishing terdeteksi:", url);

                    // Tampilkan alert di tab aktif
                    // chrome.scripting.executeScript({
                    //     target: { tabId: sender.tab.id },
                    //     func: (phishingUrl) => {
                    //         alert("⚠ Peringatan!\nLink phishing terdeteksi:\n" + phishingUrl);
                    //     },
                    //     args: [url]
                    // });

                    // Tandai elemen di halaman
                    chrome.scripting.executeScript({
                        target: { tabId: sender.tab.id },
                        function: markPhishingElement,
                        args: [url]
                    });
                }
            })
            .catch(err => console.error("❌ Gagal memeriksa URL:", err));
        });
    }
});

// Fungsi untuk menandai dan men-disable elemen phishing
function markPhishingElement(phishingUrl) {
    const allElements = [...document.querySelectorAll('a, img, iframe, script')];

    allElements.forEach(el => {
        const isMatch =
            (el.href && phishingUrl.includes(el.href)) ||
            (el.src && phishingUrl.includes(el.src));

        if (isMatch) {
            const warn = document.createElement("div");
            warn.innerHTML = "⚠ Tautan Phishing Diblokir";
            warn.style.color = "red";
            warn.style.fontSize = "13px";
            warn.style.marginTop = "6px";
            warn.style.background = "rgba(255, 0, 0, 0.1)";
            warn.style.padding = "5px 10px";
            warn.style.borderRadius = "6px";
            warn.style.fontWeight = "bold";
            warn.style.display = "inline-block";
            el.parentNode.insertBefore(warn, el.nextSibling);

            el.style.pointerEvents = "none";
            el.style.opacity = "0.5";
            el.style.border = "3px solid red";

            if (el.tagName === "A") el.removeAttribute("href");
            if (el.tagName === "IFRAME" || el.tagName === "SCRIPT") el.src = "";
        }
    });
}
