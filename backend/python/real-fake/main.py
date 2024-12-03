from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

app = Flask(__name__)

# Constants (should match those used during training)
max_length = 200
padding_type = 'post'
trunc_type = 'post'
fake_threshold = 0.61

# Load the tokenizer
with open('tokenizer.pickle', 'rb') as handle:
    loaded_tokenizer = pickle.load(handle)

# Load the pre-trained model
loaded_model = tf.keras.models.load_model('text_classification_model.h5')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the JSON request
    data = request.get_json(force=True)
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Prepare the text for prediction
    sequences = loaded_tokenizer.texts_to_sequences([text])
    padded_sequences = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

    # Make a prediction
    prediction = loaded_model.predict(padded_sequences)[0][0]

    # Determine if the text is Fake or Real based on the threshold
    result = "Fake" if prediction > fake_threshold else "Real"

    # Return the result as JSON
    return jsonify({"text": text, "prediction": result, "confidence": round(float(prediction), 4)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
