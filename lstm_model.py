# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.sequence import pad_sequences
# import numpy as np
# import re
# import pickle

# # Load model dan tokenizer (tanpa scaler karena LSTM tidak butuh standarisasi angka)
# model = load_model("model/lstmakurasi93.h5")

# with open("model/tokenizerakurasi93.pkl", "rb") as f:
#     tokenizer = pickle.load(f)

# max_len = 100  # Harus sama seperti saat training

# def clean_url(url):
#     """ Membersihkan URL sebelum tokenisasi """
#     url = url.lower()
#     url = re.sub(r"https?://", "", url)
#     url = re.sub(r"www\.", "", url)
#     return url

# def preprocess(url):
#     """ Tokenisasi dan padding URL """
#     cleaned = clean_url(url)
#     seq = tokenizer.texts_to_sequences([cleaned])
#     padded = pad_sequences(seq, maxlen=max_len)
#     return padded

# def predict_url(url):
#     """ Prediksi URL apakah phishing atau tidak """
#     x = preprocess(url)
#     prediction = model.predict(x)[0][0]
#     return {
#         "url": url,
#         "prediction": "Phishing" if prediction > 0.5 else "Safe bolo",
#         "confidence": float(prediction)
#     }

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import re
import pickle
from urllib.parse import urlparse

# ========== Load model & tokenizer ==========
model = load_model("model/lstm22.h5")

with open("model/tokenizer22.pkl", "rb") as f:
    tokenizer = pickle.load(f)

max_len = 100  # Harus sesuai saat training

def clean_url(url):
    url = url.lower()
    url = re.sub(r"https?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url

def preprocess_url(url):
    cleaned = clean_url(url)
    seq = tokenizer.texts_to_sequences([cleaned])
    padded = pad_sequences(seq, maxlen=max_len)
    return padded

def extract_features(url):
    """ Ambil 10 fitur numerik dari URL """
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    
    # Contoh ekstraksi fitur – pastikan ini sesuai saat training
    nb_www = url.count("www")
    ratio_digits_url = sum(c.isdigit() for c in url) / len(url)
    phish_hints = sum(keyword in url for keyword in ["login", "secure", "bank", "update"])
    nb_hyperlinks = url.count("http")  # simplifikasi
    domain_in_title = 0  # kalau pakai HTML scraping
    domain_age = 1       # dummy – update sesuai input real
    google_index = 1     # dummy – update sesuai input real
    page_rank = 1        # dummy – update sesuai input real

    return np.array([[nb_www, ratio_digits_url, phish_hints, nb_hyperlinks,
                      domain_in_title, domain_age, google_index, page_rank,
                      nb_www, ratio_digits_url]])  # total 10 fitur, urutan sama saat training

def predict_url(url):
    """ Prediksi URL phishing atau tidak """
    x_seq = preprocess_url(url)
    x_feat = extract_features(url)
    prediction = model.predict([x_seq, x_feat])[0][0]
    print(f'url:{url} - pred:{prediction:.2f}')
    return {
        "url": url,
        "prediction": "Phishing" if prediction > 0.1 else "Safe",
        "confidence": float(prediction)
    }
