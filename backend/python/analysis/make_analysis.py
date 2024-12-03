from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter, defaultdict
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

# Load necessary models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')
sid = SentimentIntensityAnalyzer()



# Function to extract entities
def extract_entities(text):
    doc = nlp(text)
    entities = {
        "PERSON": set(),
        "GPE": set(),
        "ORG": set(),
    }
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].add(ent.text)
    return entities

# Cluster by entity type
def cluster_by_entity_type(news_titles, sources):
    clusters = {
        "PERSON": defaultdict(list),
        "GPE": defaultdict(list),
        "ORG": defaultdict(list),
    }
    for title, source in zip(news_titles, sources):
        entities = extract_entities(title)
        for entity_type, entity_set in entities.items():
            for entity in entity_set:
                clusters[entity_type][entity].append((title, source))
    return clusters

# Sub-cluster by proper nouns
def sub_cluster_by_proper_nouns(entity_type_clusters, min_titles=10):
    proper_noun_clusters = {}
    for entity_type, entity_clusters in entity_type_clusters.items():
        proper_noun_clusters[entity_type] = {
            noun: titles for noun, titles in entity_clusters.items() if len(titles) >= min_titles
        }
    return proper_noun_clusters

# Sub-cluster by sentence similarity
def sub_cluster_by_similarity(titles, sources, threshold=0.75):
    embeddings = model.encode(titles)
    similarity_matrix = cosine_similarity(embeddings)
    
    sub_clusters = []
    visited = set()

    for i, title in enumerate(titles):
        if i not in visited:
            new_cluster = {(title, sources[i])}
            visited.add(i)

            for j in range(i + 1, len(titles)):
                if j not in visited and similarity_matrix[i, j] > threshold:
                    new_cluster.add((titles[j], sources[j]))
                    visited.add(j)

            sub_clusters.append(new_cluster)

    return sub_clusters

# TF-IDF vectorization with stop words removed
def tfidf_vectorization(titles, proper_noun):
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    tfidf_matrix = vectorizer.fit_transform(titles)
    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.sum(axis=0).A1
    word_scores = dict(zip(feature_names, tfidf_scores))

    filtered_words = {
        word: score for word, score in word_scores.items()
        if word.lower() not in STOP_WORDS and word.lower() != proper_noun.lower() and word.isalpha()
    }

    top_5_words = sorted(filtered_words.items(), key=lambda x: x[1], reverse=True)[:5]
    return [word for word, score in top_5_words]

# Perform sentiment analysis and simple emotion scoring
def analyze_sentiments_and_emotions(sub_clusters):
    results = defaultdict(lambda: defaultdict(list))

    for entity_type, proper_nouns in sub_clusters.items():
        for noun, clusters in proper_nouns.items():
            for cluster in clusters:
                titles, sources = zip(*cluster)
                cluster_sentiment = {
                    "titles": list(titles),  # Convert tuple back to list
                    "sources": list(sources),
                    "emotion_list": [],
                    "emotion_distribution": {
                        "positive": 0,
                        "neutral": 0,
                        "negative": 0
                    },
                    "top_words": [],
                    "length": len(cluster)
                }
                noun_emotions = defaultdict(int)

                for title in titles:
                    sentiment = sid.polarity_scores(title)
                    blob = TextBlob(title)
                    emotion = blob.sentiment.polarity

                    if sentiment['compound'] >= 0.05:
                        cluster_sentiment["emotion_distribution"]["positive"] += 1
                        emotion_label = 'positive'
                    elif sentiment['compound'] <= -0.05:
                        cluster_sentiment["emotion_distribution"]["negative"] += 1
                        emotion_label = 'negative'
                    else:
                        cluster_sentiment["emotion_distribution"]["neutral"] += 1
                        emotion_label = 'neutral'

                    cluster_sentiment["emotion_list"].append(emotion_label)
                    noun_emotions[emotion_label] += 1

                # Get top words
                cluster_sentiment["top_words"] = tfidf_vectorization(list(titles), noun)

                results[entity_type][noun].append(cluster_sentiment)

    return results

# Integrate everything
def organize_data(news_titles, sources):
    # Step 1: Cluster by entity type
    entity_type_clusters = cluster_by_entity_type(news_titles, sources)

    # Step 2: Sub-cluster by proper nouns (only considering clusters with > 10 titles)
    proper_noun_clusters = sub_cluster_by_proper_nouns(entity_type_clusters)

    # Step 3: Sub-cluster by similarity within proper noun clusters using sets
    final_clusters = {}
    for entity_type, proper_nouns in proper_noun_clusters.items():
        final_clusters[entity_type] = {}
        for noun, titles in proper_nouns.items():
            titles, sources = zip(*titles)
            sub_clusters = sub_cluster_by_similarity(titles, sources, 0.4)
            final_clusters[entity_type][noun] = sub_clusters

    # Step 4: Perform sentiment and emotion analysis
    organized_data = analyze_sentiments_and_emotions(final_clusters)

    return organized_data

def get_data(news_titles, sources):
    print("processing data")
    final_data = organize_data(news_titles, sources)
    return final_data


