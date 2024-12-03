import requests
import pandas as pd
import io

# URL of your Flask application
URL = "http://localhost:5000/process"

def create_test_csv(file_path):
    
    df = pd.read_csv(file_path)
    
    # Convert DataFrame to CSV string
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_string = csv_buffer.getvalue()
    
    return csv_string

def test_process_endpoint():
    # Create test CSV data
    csv_data = create_test_csv("news_sentiment_analysis.csv")
    
    # Prepare the file for upload
    files = {'file': ('test_data.csv', csv_data, 'text/csv')}
    
    try:
        # Send POST request to the /process endpoint
        response = requests.post(URL, files=files)
        
        if response.status_code == 200:
            print("Request successful!")
            print("Response JSON:")
            print(response.json())
            
            with open('response.json', 'w') as f:
                f.write(response.text)
        else:
            print(f"Request failed with status code: {response.status_code}")
            print("Error message:", response.json().get('error', 'No error message provided'))
    
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")

if __name__ == "__main__":
    test_process_endpoint()