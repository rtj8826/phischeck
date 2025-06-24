from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import re
import pickle

# Load model dan tokenizer (tanpa scaler karena LSTM tidak butuh standarisasi angka)
model = load_model("model/my_model (1).h5")

with open("model/tokenizer3.pkl", "rb") as f:
    tokenizer = pickle.load(f)

max_len = 100  # Harus sama seperti saat training

def clean_url(url):
    """ Membersihkan URL sebelum tokenisasi """
    url = url.lower()
    url = re.sub(r"https?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url

def preprocess(url):
    """ Tokenisasi dan padding URL """
    cleaned = clean_url(url)
    seq = tokenizer.texts_to_sequences([cleaned])
    padded = pad_sequences(seq, maxlen=max_len)
    return padded

def predict_url(url):
    """ Prediksi URL apakah phishing atau tidak """
    x = preprocess(url)
    prediction = model.predict(x)[0][0]
    return {
        "url": url,
        "prediction": "Phishings" if prediction > 0.5 else "Safe bolo",
        "confidence": float(prediction)
    }
