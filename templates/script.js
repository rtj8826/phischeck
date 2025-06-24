document.getElementById("check").addEventListener("click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = tabs[0].url;
        fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ url: url })
        })
        .then(res => res.json())
        .then(data => {
            const resultBox = document.getElementById("result");
            resultBox.innerHTML = `
                <strong>URL:</strong> ${data.url}<br>
                <strong>Status:</strong> ${data.prediction}<br>
                <strong>Confidence:</strong> ${data.confidence.toFixed(2)}
            `;
        })
        .catch(err => {
            document.getElementById("result").innerText = "Gagal memeriksa URLv2.";
        });
    });
});
