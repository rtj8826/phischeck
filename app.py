from flask import Flask, request, jsonify
from flask_cors import CORS
from lstm_model import predict_url 

app = Flask(__name__)
CORS(app) 

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({"error": "No URL provided"}), 400

    url = data["url"]
    result = predict_url(url)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
