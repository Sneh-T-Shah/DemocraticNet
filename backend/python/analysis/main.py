from flask import Flask, request, jsonify
from collections import defaultdict
import json
import pandas as pd
import io
from make_analysis import get_data
from top_news import get_top_trending_news
from abbreviated_analysis import get_enhanced_data

app = Flask(__name__)

def format_data_as_json(organized_data):
    formatted_data = defaultdict(list)
    
    for entity_type, proper_nouns in organized_data.items():
        for noun, clusters in proper_nouns.items():
            subclusters = []
            for cluster in clusters:
                titles = cluster['titles']
                sources = cluster['sources']
                sentiment_list = cluster['emotion_list']
                sentiment_distribution = cluster['emotion_distribution']
                common_words = cluster['top_words']
                
                title_source_pairs = [{'title': title, 'source': source} for title, source in zip(titles, sources)]
                
                subclusters.append({
                    'titles': title_source_pairs,
                    'sentiment_list': sentiment_list,
                    'sentiment_distribution': sentiment_distribution,
                    'common_words': common_words,
                    'length': cluster['length']
                })
                
            formatted_data[entity_type].append({
                'noun_label': noun,
                'subclusters': subclusters
            })
    
    return formatted_data

def process_data(csv_file):
    # Read the CSV file
    df = pd.read_csv(csv_file)
    
    # Ensure the required columns exist
    if 'Title' not in df.columns or 'Source' not in df.columns:
        raise ValueError("CSV file must contain 'title' and 'source' columns")
    
    # Extract titles and sources
    titles = df['Title'].tolist()
    sources = df['Source'].tolist()
    
    
    # Process the data using the existing get_data function
    processed_data = get_data(titles, sources)
    # Format the processed data as JSON
    json_data = format_data_as_json(processed_data)
    top_50_news = get_top_trending_news(json_data)
    for i, (title, source) in enumerate(top_50_news, 1):
        print(f"{i}. {title} (Source: {source})")
    return json_data

@app.route('/process', methods=['POST'])
def process_request():
    try:
        # Check if the POST request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Check if the file is a CSV
        if not file.filename.lower().endswith('.csv'):
            return jsonify({"error": "Uploaded file must be a CSV"}), 400
        
        # Process the CSV file
        csv_file = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        processed_data = process_data(csv_file)
        
        # Return the processed data as JSON
        return jsonify(processed_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=False)