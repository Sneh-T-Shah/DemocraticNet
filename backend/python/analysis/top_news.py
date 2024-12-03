from collections import defaultdict
import heapq

def get_top_trending_news(final_data, top_n=50):
    # Create a list to store all news items with their scores
    all_news = []
    
    for entity_type in final_data:
        for proper_noun in final_data[entity_type]:
            for cluster in final_data[entity_type][proper_noun]:
                # Calculate a score for each cluster
                score = (
                    cluster['length'] * 2 +  # Size of cluster
                    cluster['emotion_distribution']['positive'] -  # Positive emotions
                    cluster['emotion_distribution']['negative'] +  # Negative emotions
                    len(set(cluster['top_words']))  # Unique top words
                )
                
                # Add each title in the cluster to all_news
                for title, source in zip(cluster['titles'], cluster['sources']):
                    all_news.append((-score, title, source))  # Use negative score for max-heap
    
    # Use heapq to efficiently get the top N items
    top_news = heapq.nsmallest(top_n, all_news)
    
    # Return the results without the scores
    return [(title, source) for _, title, source in top_news]

# Usage
