from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
# cross origin
from flask_cors import CORS
from sample_scrapping import get_articles

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return "Hello, world!"


@app.route('/api/get_list')
def get_list():
    return jsonify(get_articles())


if __name__ == '__main__':
    app.run(debug=True, port=7204)