document.getElementById("check").addEventListener("click", function() {
    const resultBox = document.getElementById("result");
    const loadingSpinner = document.getElementById("loading");

    // Tampilkan loading dan kosongkan hasil sebelumnya
    loadingSpinner.style.display = "block";
    resultBox.innerHTML = "";

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "START_SCRAPING" });
        const url = tabs[0].url;

        fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url })
        })
        .then(res => res.json())
        .then(data => {
            loadingSpinner.style.display = "none"; 
            resultBox.innerHTML = `
                <strong>URL:</strong> ${data.url}<br>
                <strong>Status:</strong> ${data.prediction}<br>   
            `;
            console.log(data);

        })
        .catch(err => {
            loadingSpinner.style.display = "none"; // Sembunyikan loading jika gagal
            resultBox.innerText = "Gagal memeriksa URL!";
        });
    });
});
//<strong>Confidence:</strong> ${data.confidence.toFixed(2)}