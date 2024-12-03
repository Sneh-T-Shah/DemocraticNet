from goose3 import Goose
from googletrans import Translator
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

def extract_article_content(urls: List[str], max_retries: int = 3, source_name="") -> List[Dict[str, Optional[str]]]:
    """
    Extract content from a list of article URLs using Goose3 and translate non-English content.
    
    :param urls: List of article URLs to process
    :param max_retries: Maximum number of retries for each URL
    :param source_name: Name of the source for tracking purposes
    :return: List of dictionaries containing extracted and processed article data
    """
    g = Goose()
    translator = Translator()
    articles_data = []
    print(f"Processing {len(urls)} articles from {source_name}")
    
    for url in urls:
        retries = 0
        while retries < max_retries:
            try:
                article = g.extract(url=url)
                title = article.title

                if article.meta_lang == "en":
                    text = article.cleaned_text
                else:
                    print(f"Translating {url} from {article.meta_lang} to English")
                    title = translator.translate(title).text
                    text = translator.translate(article.cleaned_text).text

                if text and title:
                    temp = {
                        "title": title,
                        "link": url,
                        "text": text[:500] + "..." if len(text) > 500 else text,
                        "authors": article.authors,
                        "publish_date": str(article.publish_date) if article.publish_date else None,
                        'source': source_name
                    }
                    articles_data.append(temp)
                    # print(f"Successfully processed: {url}")
                    break 
                else:
                    print(f"Skipping {url}: Empty title or text")
                    break

            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    print(f"Failed to process {url} after {max_retries} retries: {e}")
    
    return articles_data

def scrape_news_links(url: str, container_tag: str, attribute: Optional[str] = None, value: Optional[str] = None, link_tag: str = 'a') -> List[str]:
    """
    Scrape news article links from a given website based on a single HTML container tag and an attribute-value pair.
    
    :param url: The URL of the news website to scrape
    :param container_tag: The HTML tag containing the article links
    :param attribute: The attribute to match in the container tag (e.g., 'class', 'data-testid')
    :param value: The value of the attribute to match
    :param link_tag: The tag of the actual link, defaults to 'a'
    :return: A list of article URLs
    """
    try:
        # Send a GET request to the URL
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all container tags with the specified attribute-value pair (if provided)
        if attribute and value:
            containers = soup.find_all(container_tag, attrs={attribute: value})
        else:
            containers = soup.find_all(container_tag)
        
        # Extract links from the elements
        links = set()
        for container in containers:
            link_element = container.find(link_tag)
            if link_element and link_element.get('href'):
                # Make sure the link is an absolute URL
                full_url = urljoin(url, link_element['href'])
                links.add(full_url)
        
        return list(links)
    
    except requests.RequestException as e:
        print(f"An error occurred while fetching the webpage: {e}")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def get_articles(max_articles: 200) -> List[Dict[str, Optional[str]]]:
    """
    Scrape articles from multiple news sources and extract their content.
    
    :param max_articles: Maximum number of articles to retrieve from each source
    :return: A list of dictionaries containing article data from different sources
    """
    collected_data = []

    # Scrape articles from The Hindu
    hindu_links = scrape_news_links(
        url="https://www.thehindu.com/latest-news/",
        container_tag="h3",
        attribute="class",
        value="title"
    )
    print(f"Found {len(hindu_links)} links on The Hindu")
    sample_links = hindu_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="The Hindu")
    collected_data.extend(articles_data)
    
    hindu_links = scrape_news_links(
    url="https://www.thehindu.com/news/national/",
    container_tag="h3",
    attribute="class",
    value="title"
    )
    print(f"Found {len(hindu_links)} links on The Hindu")
    sample_links = hindu_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="The Hindu")
    collected_data.extend(articles_data)
    
    hindu_links = scrape_news_links(
    url="https://www.thehindu.com/news/international/",
    container_tag="h3",
    attribute="class",
    value="title"
    )
    print(f"Found {len(hindu_links)} links on The Hindu")
    sample_links = hindu_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="The Hindu")
    collected_data.extend(articles_data)
    
    # Scrape articles from Times of India
    toi_links = scrape_news_links(
        url="https://timesofindia.indiatimes.com/",
        container_tag="figure",
        attribute="class",
        value="_YVis false false"
    )
    print(f"Found {len(toi_links)} links on Times of India")
    sample_links = toi_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Times of India")
    collected_data.extend(articles_data)
    
        # Scrape articles from Times of India
    toi_links = scrape_news_links(
        url="https://timesofindia.indiatimes.com/",
        container_tag="figure",
        attribute="class",
        value="_YVis false false"
    )
    print(f"Found {len(toi_links)} links on Times of India")
    sample_links = toi_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Times of India")
    collected_data.extend(articles_data)
    
    
    toi_links = scrape_news_links(
    url="https://timesofindia.indiatimes.com/india",
    container_tag="div",
    attribute="class",
    value="iN5CR"
    )
    print(f"Found {len(toi_links)} links on Times of India")
    sample_links = toi_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Times of India")
    collected_data.extend(articles_data)
    
    toi_links = scrape_news_links(
    url="https://timesofindia.indiatimes.com/world",
    container_tag="div",
    attribute="class",
    value="iN5CR"
    )
    print(f"Found {len(toi_links)} links on Times of India")
    sample_links = toi_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Times of India")
    collected_data.extend(articles_data)
    
    # Scrape articles from Indian Express
    indian_links = scrape_news_links(
        url="https://indianexpress.com/",
        container_tag="h3",
        attribute="class",
        value=""
    )
    print(f"Found {len(indian_links)} links on Indian Express")
    sample_links = indian_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Indian Express")
    collected_data.extend(articles_data)
    
    indian_links = scrape_news_links(
    url="https://indianexpress.com/section/india/",
    container_tag="h2",
    attribute="class",
    value="title"
    )
    print(f"Found {len(indian_links)} links on Indian Express")
    sample_links = indian_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Indian Express")
    collected_data.extend(articles_data)
    
    indian_links = scrape_news_links(
    url="https://indianexpress.com/section/political-pulse/",
    container_tag="h2",
    attribute="class",
    value="title"
    )
    print(f"Found {len(indian_links)} links on Indian Express")
    sample_links = indian_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="Indian Express")
    collected_data.extend(articles_data)
    
    
    bbc_links = scrape_news_links(
        url="https://www.bbc.com/",
        container_tag="div",
                attribute="data-testid",
        value="anchor-inner-wrapper"
    )
    
    print(f"Found {len(bbc_links)} links on BBC")
    bbc_links = bbc_links[10:]
    sample_links = bbc_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="BBC")
    collected_data.extend(articles_data)
    
    india_today_links = scrape_news_links(
        url="https://www.indiatoday.in/",
        container_tag="div",
        attribute="class",
        value="B1S3_content__wrap__9mSB6"
    )
    print(f"Found {len(india_today_links)} links on India Today")
    sample_links = india_today_links[:max_articles]
    articles_data = extract_article_content(sample_links, source_name="India Today")
    collected_data.extend(articles_data)
    
    return collected_data
# Example usage

print(get_articles(5))