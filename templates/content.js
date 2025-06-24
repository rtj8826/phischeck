(function () {
    const sentUrls = new Set(); // Cache untuk mencegah pengiriman URL yang sama berkali-kali

    const collectUrls = () => {
        const urls = new Set();
        document.querySelectorAll('a[href], img[src], iframe[src], script[src]').forEach(el => {
            if (el.href) urls.add(el.href);
            if (el.src) urls.add(el.src);
        });
        return Array.from(urls);
    };

    const sendUrls = (urlArray) => {
        const newUrls = urlArray.filter(url => !sentUrls.has(url));
        newUrls.forEach(url => sentUrls.add(url));
        if (newUrls.length > 0) {
            console.log("🔎 Mengirim URL ke background:", newUrls);
            chrome.runtime.sendMessage({ type: "CHECK_URLS", urls: newUrls });
        }
    };

    // Kirim URL awal saat halaman dimuat
    const initialUrls = collectUrls();
    sendUrls(initialUrls);

    // Pantau perubahan DOM secara dinamis
    const observer = new MutationObserver(() => {
        const dynamicUrls = collectUrls();
        sendUrls(dynamicUrls);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
