from collections import Counter, defaultdict
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

max_length = 200
padding_type = 'post'
trunc_type = 'post'
fake_threshold = 0.61

# Load the tokenizer
with open('tokenizer.pickle', 'rb') as handle:
    loaded_tokenizer = pickle.load(handle)

# Load the pre-trained model
loaded_model = tf.keras.models.load_model('text_classification_model.h5')

def fake_news_detection(title):
    sequences = loaded_tokenizer.texts_to_sequences([title])
    padded_sequences = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

    # Make a prediction
    prediction = loaded_model.predict(padded_sequences,verbose=False)[0][0]

    # Determine if the text is Fake or Real based on the threshold
    result = "fake" if prediction > fake_threshold else "real"
    return result

def aggregate_sentiment(sentiments):
    total = len(sentiments)
    return {
        "positive": sentiments.count("positive"),
        "neutral": sentiments.count("neutral"),
        "negative": sentiments.count("negative")
    }

def get_top_n_trending(data, n):
    return data.most_common(n)

def enhance_data_with_fake_news_and_trending(data, n_top=5):
    # Initialize summary structures
    entity_type_summary = defaultdict(lambda: {"total_titles": 0, "fake_news_count": 0, "real_news_count": 0, "sentiment_distribution": Counter(), "source_distribution": Counter(), "top_trending": []})

    for entity_type, proper_nouns in data.items():
        for noun, clusters in proper_nouns.items():
            noun_sentiments = []
            noun_sources = []
            noun_fake_news_count = 0
            noun_real_news_count = 0
            
            for cluster in clusters:
                titles = cluster["titles"]
                sources = cluster["sources"]
                emotion_list = cluster["emotion_list"]

                # Fake News Detection
                real_fake_labels = [fake_news_detection(title) for title in titles]
                noun_fake_news_count += real_fake_labels.count("fake")
                noun_real_news_count += real_fake_labels.count("real")
                
                # Update cluster with fake/real news counts
                cluster["fake_news_count"] = real_fake_labels.count("fake")
                cluster["real_news_count"] = real_fake_labels.count("real")

                # Update sentiment distribution in the cluster
                cluster["emotion_distribution"] = aggregate_sentiment(emotion_list)

                # Update sentiment and source distribution at noun level
                noun_sentiments.extend(emotion_list)
                noun_sources.extend(sources)

            # Update proper noun level in the original data structure
            proper_nouns[noun][0]["sentiment_distribution"] = aggregate_sentiment(noun_sentiments)
            proper_nouns[noun][0]["source_distribution"] = Counter(noun_sources)
            proper_nouns[noun][0]["fake_news_count"] = noun_fake_news_count
            proper_nouns[noun][0]["real_news_count"] = noun_real_news_count

            # Aggregate to entity level
            entity_type_summary[entity_type]["total_titles"] += len(titles)
            entity_type_summary[entity_type]["sentiment_distribution"].update(noun_sentiments)
            entity_type_summary[entity_type]["source_distribution"].update(noun_sources)
            entity_type_summary[entity_type]["fake_news_count"] += noun_fake_news_count
            entity_type_summary[entity_type]["real_news_count"] += noun_real_news_count

        # Calculate top N trending proper nouns for each entity type
        proper_nouns_counter = Counter({noun: len(clusters) for noun, clusters in proper_nouns.items()})
        entity_type_summary[entity_type]["top_trending"] = get_top_n_trending(proper_nouns_counter, n_top)

    # Integrate entity_type_summary back into the original data structure
    for entity_type in entity_type_summary:
        sentiments = list(entity_type_summary[entity_type]["sentiment_distribution"].elements())
        entity_type_summary[entity_type]["sentiment_distribution"] = aggregate_sentiment(sentiments)

    return entity_type_summary

def get_enhanced_data(data, n_top=5):
    # Enhance the data structure with fake news detection and trending analysis
    enhanced_data = enhance_data_with_fake_news_and_trending(data, n_top)
    return enhanced_data