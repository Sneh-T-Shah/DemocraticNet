import requests
from goose3 import Goose

g = Goose()
url = "https://www.ndtv.com/"

print(requests.get(url))

article = g.extract(url="https://www.ndtv.com/india-news/another-fir-in-mollywood-metoo-storm-actor-claims-was-lured-to-hotel-by-top-director-ranjith-6457428#pfrom=home-ndtv_topscroll")

print(article.title)