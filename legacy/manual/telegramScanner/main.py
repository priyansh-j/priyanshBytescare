import os
import tempfile
import logging
import re
import csv
from telethon.sync import TelegramClient
from telethon import functions, types
import sys
import time
import datetime


# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)
# Get and change to the system's temporary directory in a cross-platform way
temp_dir = tempfile.gettempdir()
os.chdir(temp_dir)
# Telegram API credentials
api_id = '25538849'
api_hash = '4468109211b1fc4f76ec4807dcaeba14'
phone_number = '+917791853026'

# Set the session file path using the phone number
session_file_path = f'+917791853026.session'
def search_and_return_results(client, query, unique_results):
    print(f"[{datetime.datetime.now()}] Searching for: {query}")
    result = client(functions.contacts.SearchRequest(q=query, limit=100))
    search_results = []
    for chat in result.chats:
        if isinstance(chat, types.Channel):
            url = f'https://t.me/{chat.username}' if chat.username else ''
            id_url = f'https://t.me/c/{chat.id}'
            row = (id_url, chat.title, url)
            if row not in unique_results:
                search_results.append(row)
                unique_results.add(row)
    return search_results

def main():
    print(f"[{datetime.datetime.now()}] Initializing...")
    # Read queries from command-line arguments
    queries = sys.argv[1:] if len(sys.argv) > 1 else []
    # sys.argv[1:] if len(sys.argv) > 1 else []
    if not queries:
        logger.error("No queries provided. Please provide queries as command-line arguments.")
        sys.exit(1)
    # Initialize unique results set
    unique_results = set()
    csv_data = []
    with TelegramClient(session_file_path, api_id, api_hash) as client:
        # Search for initial queries and extract keywords
        extracted_keywords = set()
        for query in queries:
            if query.strip():
                search_results = search_and_return_results(client, query, unique_results)
                csv_data.extend(search_results)
                search_output = '\n'.join([' '.join(map(str, res)) for res in search_results])
                extracted_keywords.update(set(re.findall(r'\b[a-zA-Z]+\b', search_output)) - {'finance', '1', 'percent', 'club', 'tax'})
                time.sleep(0.7)
        # Generate and search new queries using extracted keywords
        for keyword in extracted_keywords:
            for query in queries:
                new_query = f"{keyword} {query}"
                if new_query.strip():
                    search_results = search_and_return_results(client, new_query, unique_results)
                    csv_data.extend(search_results)
                    time.sleep(0.7)
    # Save results to CSV file
    csv_file_path = f'/Users/ps/Documents/bytescare/bytescareCrawlers/manual/telegramScanner/search_results.csv'
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["ID", "Title", "URL/Username"])
        writer.writerows(csv_data)
    # Optionally, print CSV data to console or handle it as needed
    # with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
    #     print(csvfile.read())
        
if __name__ == '__main__':
    main()
