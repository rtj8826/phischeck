chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_SCRAPING") {
        startScraping();
    } else if (message.action === "BLOCK_URLS") {
        message.phishingUrls.forEach(url => {
            markPhishingElement(url);
        });
    }
});

const sentUrls = new Set();

function collectUrls() {
    const urls = new Set();
    document.querySelectorAll('a[href], img[src], iframe[src], script[src]').forEach(el => {
        if (el.href) urls.add(el.href);
        if (el.src) urls.add(el.src);
    });
    return Array.from(urls);
}

function sendUrls(urlArray) {
    const newUrls = urlArray.filter(url => !sentUrls.has(url));
    newUrls.forEach(url => sentUrls.add(url));
    if (newUrls.length > 0) {
        console.log("🔎 Mengirim URL ke background:", newUrls);
        chrome.runtime.sendMessage({ type: "CHECK_URLS", urls: newUrls });
    }
}

function startScraping() {
    const initialUrls = collectUrls();
    sendUrls(initialUrls);

    const observer = new MutationObserver(() => {
        const dynamicUrls = collectUrls();
        sendUrls(dynamicUrls);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function markPhishingElement(phishingUrl) {
    const allElements = [...document.querySelectorAll('a, img, iframe, script')];

    allElements.forEach(el => {
        const match =
            (el.href && phishingUrl === el.href) ||
            (el.src && phishingUrl === el.src);

        if (match) {
            const warn = document.createElement("div");
            warn.innerText = "⚠ Tautan Phishing Diblokir";
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
            if (["IFRAME", "SCRIPT"].includes(el.tagName)) el.src = "";
        }
    });
}
