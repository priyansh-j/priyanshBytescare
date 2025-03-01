import os
import logging
import csv
from telethon.sync import TelegramClient
from telethon import functions, types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram API credentials
api_id = '25538849'
api_hash = '4468109211b1fc4f76ec4807dcaeba14'
phone_number = '+917791853026'

# URLs to check
urls = [
    "one.exnesslink.com",
    "one.exnesstrack.com",
    "one.exness-track.com",
    "one.exnesstrack.net",
    "one.exnesstrack.org",
    "one.exnessonelink.com",
    "one.toexness.com",
    "one.exness-direct.com"
]

def contains_url(text, urls):
    if text:
        for url in urls:
            if url in text:
                return True
    return False

def get_shared_links(client, chat, urls, limit=100):
    try:
        messages = client(functions.messages.GetHistoryRequest(
            peer=chat,
            limit=limit,
            offset_date=None,
            offset_id=0,
            min_id=0,
            max_id=0,
            add_offset=0,
            hash=0
        )).messages
        shared_links = [message.message for message in messages if message.message and contains_url(message.message, urls)]
        return ', '.join(shared_links)
    except Exception as e:
        logger.error(f"Error fetching shared links: {e}")
        return ''

def search_and_return_results(client, query, unique_results):
    logger.info(f"Searching for: {query}")

    try:
        result = client(functions.contacts.SearchRequest(q=query, limit=100))
    except Exception as e:
        logger.error(f"Search request failed: {e}")
        return []

    search_results = []
    for chat in result.chats:
        if isinstance(chat, types.Channel):
            url = f'https://t.me/{chat.username}' if chat.username else ''
            id_url = f'https://t.me/c/{chat.id}'

            try:
                # Fetch full channel information to get the description and pinned message
                full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
                description = full_chat.full_chat.about if full_chat.full_chat.about else ''

                # Fetching the pinned message
                pinned_message = ''
                if full_chat.full_chat.pinned_msg_id:
                    pinned_message = client.get_messages(chat, ids=full_chat.full_chat.pinned_msg_id).message

                # Fetching the shared links
                shared_links = get_shared_links(client, chat, urls)

                description_status = 'Match' if contains_url(description, urls) else 'Not Match'
                pinned_comment_status = 'Match' if contains_url(pinned_message, urls) else 'Not Match'
                shared_links_status = 'Match' if shared_links else 'Not Match'

                logger.info(f"Channel: {chat.title}, Description Status: {description_status}, Pinned Comment Status: {pinned_comment_status}, Shared Links Status: {shared_links_status}")

                row = (id_url, chat.title, url, description, pinned_message, description_status, pinned_comment_status, shared_links, shared_links_status)
                if row not in unique_results:
                    search_results.append(row)
                    unique_results.add(row)
            except Exception as e:
                logger.error(f"Error processing chat {chat.id}: {e}")

    return search_results

def main():
    # List of queries to search for
    queries = [
        'exness links',
        'exness traders',
        'exness forex traders'
    ]

    # Initialize unique results set
    unique_results = set()
    csv_data = []

    with TelegramClient('anon', api_id, api_hash) as client:
        try:
            # Ensure the client is connected
            me = client.get_me()
            logger.info(f"Connected to Telegram as {me.username}")

            # Search for the queries provided in the list
            for query in queries:
                if query.strip():
                    search_results = search_and_return_results(client, query, unique_results)
                    logger.info(f"Results for {query}: {search_results}")
                    csv_data.extend(search_results)
        except Exception as e:
            logger.error(f"Error during Telegram client session: {e}")

    logger.info(f"CSV Data: {csv_data}")

    # Save results to CSV file
    csv_file_path = 'search_results.csv'

    try:
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["ID", "Title", "URL/Username", "Description", "Pinned Message", "Description Status", "Pinned Comment Status", "Shared Links", "Shared Links Status"])
            writer.writerows(csv_data)
        logger.info(f"Data written to {csv_file_path}")
    except Exception as e:
        logger.error(f"Failed to write data to CSV file: {e}")

    # Optionally, print CSV data to console or handle it as needed
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            print(csvfile.read())
    except Exception as e:
        logger.error(f"Failed to read the CSV file: {e}")

if __name__ == '__main__':
    main()


















# import os
# import logging
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# # URLs to check
# urls = [
#     "one.exnesslink.com",
#     "one.exnesstrack.com",
#     "one.exness-track.com",
#     "one.exnesstrack.net",
#     "one.exnesstrack.org",
#     "one.exnessonelink.com",
#     "one.toexness.com",
#     "one.exness-direct.com"
# ]

# def contains_url(text, urls):
#     if text:
#         for url in urls:
#             if url in text:
#                 return True
#     return False

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description and pinned message
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''
            
#             # Fetching the pinned message
#             pinned_message = ''
#             if full_chat.full_chat.pinned_msg_id:
#                 pinned_message = client.get_messages(chat, ids=full_chat.full_chat.pinned_msg_id).message

#             description_status = 'Match' if contains_url(description, urls) else 'Not Match'
#             pinned_comment_status = 'Match' if contains_url(pinned_message, urls) else 'Not Match'

#             logger.info(f"Channel: {chat.title}, Description Status: {description_status}, Pinned Comment Status: {pinned_comment_status}")

#             row = (id_url, chat.title, url, description, pinned_message, description_status, pinned_comment_status)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # List of queries to search for
#     queries = [
#     # 'exness_trades', 
#     # 'exness forex trades',
#     # 'exness copytrading'

#     # 'exness links',
#     # 'exness trade links',
#     # 'exness forex links'
    
#     'exness links',
#     'exness traders',
#     'exness forex traders'


#     ]

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient('anon', api_id, api_hash) as client:
#         # Ensure the client is connected
#         me = client.get_me()
#         logger.info(f"Connected to Telegram as {me.username}")

#         # Search for the queries provided in the list
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 logger.info(f"Results for {query}: {search_results}")
#                 csv_data.extend(search_results)

#     logger.info(f"CSV Data: {csv_data}")

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'

#     try:
#         with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#             writer = csv.writer(csvfile)
#             writer.writerow(["ID", "Title", "URL/Username", "Description", "Pinned Message", "Description Status", "Pinned Comment Status"])
#             writer.writerows(csv_data)
#         logger.info(f"Data written to {csv_file_path}")
#     except Exception as e:
#         logger.error(f"Failed to write data to CSV file: {e}")

#     # Optionally, print CSV data to console or handle it as needed
#     try:
#         with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#             print(csvfile.read())
#     except Exception as e:
#         logger.error(f"Failed to read the CSV file: {e}")

# if __name__ == '__main__':
#     main()

















# import os
# import logging
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description and pinned message
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''
            
#             # Fetching the pinned message
#             pinned_message = None
#             if full_chat.full_chat.pinned_msg_id:
#                 pinned_message = client.get_messages(chat, ids=full_chat.full_chat.pinned_msg_id).message

#             row = (id_url, chat.title, url, description, pinned_message)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # List of queries to search for
#     queries = ['exness']

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient('anon', api_id, api_hash) as client:
#         # Ensure the client is connected
#         me = client.get_me()
#         logger.info(f"Connected to Telegram as {me.username}")

#         # Search for the queries provided in the list
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 logger.info(f"Results for {query}: {search_results}")
#                 csv_data.extend(search_results)

#     logger.info(f"CSV Data: {csv_data}")

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'

#     try:
#         with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#             writer = csv.writer(csvfile)
#             writer.writerow(["ID", "Title", "URL/Username", "Description", "Pinned Message"])
#             writer.writerows(csv_data)
#         logger.info(f"Data written to {csv_file_path}")
#     except Exception as e:
#         logger.error(f"Failed to write data to CSV file: {e}")

#     # Optionally, print CSV data to console or handle it as needed
#     try:
#         with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#             print(csvfile.read())
#     except Exception as e:
#         logger.error(f"Failed to read the CSV file: {e}")

# if __name__ == '__main__':
#     main()














# import os
# import logging
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''

#             row = (id_url, chat.title, url, description)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # List of queries to search for
#     queries = ['exness']

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient('anon', api_id, api_hash) as client:
#         # Ensure the client is connected
#         me = client.get_me()
#         logger.info(f"Connected to Telegram as {me.username}")

#         # Search for the queries provided in the list
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 logger.info(f"Results for {query}: {search_results}")
#                 csv_data.extend(search_results)

#     logger.info(f"CSV Data: {csv_data}")

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'

#     try:
#         with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#             writer = csv.writer(csvfile)
#             writer.writerow(["ID", "Title", "URL/Username", "Description"])
#             writer.writerows(csv_data)
#         logger.info(f"Data written to {csv_file_path}")
#     except Exception as e:
#         logger.error(f"Failed to write data to CSV file: {e}")

#     # Optionally, print CSV data to console or handle it as needed
#     try:
#         with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#             print(csvfile.read())
#     except Exception as e:
#         logger.error(f"Failed to read the CSV file: {e}")

# if __name__ == '__main__':
#     main()












# import os
# import tempfile
# import logging
# import re
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Get and change to the system's temporary directory in a cross-platform way
# temp_dir = tempfile.gettempdir()
# os.chdir(temp_dir)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''

#             row = (id_url, chat.title, url, description)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # List of queries to search for
#     queries = ['exness']

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient('anon', api_id, api_hash) as client:
#         # Search for the queries provided in the list
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 logger.info(f"Results for {query}: {search_results}")
#                 csv_data.extend(search_results)

#     logger.info(f"CSV Data: {csv_data}")

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'
#     with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#         writer = csv.writer(csvfile)
#         writer.writerow(["ID", "Title", "URL/Username", "Description"])
#         writer.writerows(csv_data)

#     logger.info(f"Data written to {csv_file_path}")

#     # Optionally, print CSV data to console or handle it as needed
#     with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#         print(csvfile.read())

# if __name__ == '__main__':
#     main()












# import os
# import tempfile
# import logging
# import re
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Get and change to the system's temporary directory in a cross-platform way
# temp_dir = tempfile.gettempdir()
# os.chdir(temp_dir)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''

#             row = (id_url, chat.title, url, description)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # List of queries to search for
#     queries = ['physics wallah']

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient('anon', api_id, api_hash) as client:
#         # Search for the queries provided in the list
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 csv_data.extend(search_results)

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'
#     with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#         writer = csv.writer(csvfile)
#         writer.writerow(["ID", "Title", "URL/Username", "Description"])
#         writer.writerows(csv_data)

#     # Optionally, print CSV data to console or handle it as needed
#     with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#         print(csvfile.read())

# if __name__ == '__main__':
#     main()









# import os
# import tempfile
# import logging
# import re
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types
# import sys

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Get and change to the system's temporary directory in a cross-platform way
# temp_dir = tempfile.gettempdir()
# os.chdir(temp_dir)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# # Set the session file path using the phone number
# session_file_path = f'{phone_number}.session'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'

#             # Fetch full channel information to get the description
#             full_chat = client(functions.channels.GetFullChannelRequest(channel=chat))
#             description = full_chat.full_chat.about if full_chat.full_chat.about else ''

#             row = (id_url, chat.title, url, description)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # Read queries from command-line arguments
#     queries = ['physics wallah', 'allen kota']
#     # sys.argv[1:] if len(sys.argv) > 1 else []

#     if not queries:
#         logger.error("No queries provided. Please provide queries as command-line arguments.")
#         sys.exit(1)

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient(session_file_path, api_id, api_hash) as client:
#         # Search for initial queries and extract keywords
#         extracted_keywords = set()
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 csv_data.extend(search_results)
#                 search_output = '\n'.join([' '.join(map(str, res)) for res in search_results])
#                 extracted_keywords.update(set(re.findall(r'\b[a-zA-Z]+\b', search_output)) - {'by', 'PDF', 'By', 'Sir'})

#         # Generate and search new queries using extracted keywords
#         for keyword in extracted_keywords:
#             for query in queries:
#                 new_query = f"{keyword} {query}"
#                 if new_query.strip():
#                     search_results = search_and_return_results(client, new_query, unique_results)
#                     csv_data.extend(search_results)

#     # Save results to CSV file
#     csv_file_path = 'search_results.csv'
#     with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#         writer = csv.writer(csvfile)
#         writer.writerow(["ID", "Title", "URL/Username", "Description"])
#         writer.writerows(csv_data)

#     # Optionally, print CSV data to console or handle it as needed
#     with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#         print(csvfile.read())

# if __name__ == '__main__':
#     main()















# import os
# import tempfile
# import logging
# import re
# import csv
# from telethon.sync import TelegramClient
# from telethon import functions, types
# import sys

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Get and change to the system's temporary directory in a cross-platform way
# temp_dir = tempfile.gettempdir()
# os.chdir(temp_dir)

# # Telegram API credentials
# api_id = '25538849'
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# phone_number = '+917791853026'

# # Set the session file path using the phone number
# session_file_path = f'+917791853026.session'

# def search_and_return_results(client, query, unique_results):
#     logger.info(f"Searching for: {query}")

#     result = client(functions.contacts.SearchRequest(q=query, limit=100))

#     search_results = []
#     for chat in result.chats:
#         if isinstance(chat, types.Channel):
#             url = f'https://t.me/{chat.username}' if chat.username else ''
#             id_url = f'https://t.me/c/{chat.id}'
#             row = (id_url, chat.title, url)
#             if row not in unique_results:
#                 search_results.append(row)
#                 unique_results.add(row)

#     return search_results

# def main():
#     # Read queries from command-line arguments
#     queries = ['physics wallah','allen kota']
#     # sys.argv[1:] if len(sys.argv) > 1 else []

#     if not queries:
#         logger.error("No queries provided. Please provide queries as command-line arguments.")
#         sys.exit(1)

#     # Initialize unique results set
#     unique_results = set()
#     csv_data = []

#     with TelegramClient(session_file_path, api_id, api_hash) as client:
#         # Search for initial queries and extract keywords
#         extracted_keywords = set()
#         for query in queries:
#             if query.strip():
#                 search_results = search_and_return_results(client, query, unique_results)
#                 csv_data.extend(search_results)
#                 search_output = '\n'.join([' '.join(map(str, res)) for res in search_results])
#                 extracted_keywords.update(set(re.findall(r'\b[a-zA-Z]+\b', search_output)) - {'by', 'PDF', 'By', 'Sir'})

#         # Generate and search new queries using extracted keywords
#         for keyword in extracted_keywords:
#             for query in queries:
#                 new_query = f"{keyword} {query}"
#                 if new_query.strip():
#                     search_results = search_and_return_results(client, new_query, unique_results)
#                     csv_data.extend(search_results)

#     # Save results to CSV file
#     csv_file_path = f'search_results.csv'
#     with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
#         writer = csv.writer(csvfile)
#         writer.writerow(["ID", "Title", "URL/Username"])
#         writer.writerows(csv_data)

#     # Optionally, print CSV data to console or handle it as needed
#     with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
#         print(csvfile.read())

# if __name__ == '__main__':
#     main()











# import csv
# import re
# from telethon.sync import TelegramClient
# from telethon import functions, types
# import sys
# import json

# # Telegram API credentials
# # Telegram API credentials
# api_id = '25538849' # replace with your api_id
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'  # replace with your api_hash
# phone_number ='+917791853026'  # replace with your new phone number

# # Creating a session
# client = TelegramClient(phone_number, api_id, api_hash)

# # async def search_and_return_results(client, query):
# #     print(f"Searching for: {query}")
# #     result = await client(functions.contacts.SearchRequest(q=query, limit=100))
# #     search_results = []
# #     for chat in result.chats:
# #         if isinstance(chat, types.Channel):
# #             url = 'https://t.me/' + chat.username if chat.username else 'N/A'
# #             id_url = f'https://t.me/c/{chat.id}'
# #             row = (id_url, chat.title, url)
# #             search_results.append(row)
# #     return search_results

# async def search_and_return_results(client, query):
#     print(f"Searching for: {query}")
#     offset = 0
#     limit = 100
#     all_results = []
    
#     while True:
#         result = await client(functions.contacts.SearchRequest(q=query, limit=limit))
#         if not result.chats:
#             break
        
#         for chat in result.chats:
#             if isinstance(chat, types.Channel):
#                 url = 'https://t.me/' + chat.username if chat.username else 'N/A'
#                 id_url = f'https://t.me/c/{chat.id}'
#                 row = (id_url, chat.title, url)
#                 all_results.append(row)
        
#         offset += len(result.chats)
#         if len(result.chats) < limit:
#             break

#     return all_results


# async def main():
#     await client.start()
#     print("Client Created and Connected")
    
#     if len(sys.argv) > 1:
#         queries = sys.argv[1].split(',')  # Expecting a comma-separated list of queries
#     else:
#         queries = []  # Modify your queries here
    
#     unique_results = set()
#     all_data = []

#     for query in queries:
#         search_results = await search_and_return_results(client, query)
#         for item in search_results:
#             if item not in unique_results:
#                 all_data.append({
#                     "ID": item[0],
#                     "Title": item[1],
#                     "URL/Username": item[2]
#                 })
#                 unique_results.add(item)

#     # Print JSON data to stdout
#     print(json.dumps(all_data))

# if __name__ == '__main__':
#     with client:
#         client.loop.run_until_complete(main())


# async def main():
#     await client.start()

#     print("Client Created and Connected")
    
#     if len(sys.argv) > 1:
#        queries = sys.argv[1].split(',')  # Expecting a comma-separated list of queries
#     else:
#        queries = [
        
#        ] # Modify your queries here
#     unique_results = set()
#     all_data = []

#     for query in queries:
#         search_results = await search_and_return_results(client, query)
#         for item in search_results:
#             if item not in unique_results:
#                 all_data.append(item)
#                 unique_results.add(item)

#     # Writing results to CSV
#     with open('search_results.csv', 'w', newline='', encoding='utf-8') as csvfile:
#         writer = csv.writer(csvfile)
#         writer.writerow(["ID", "Title", "URL/Username"])
#         writer.writerows(all_data)
#     print("Data has been written to search_results.csv")

# if __name__ == '__main__':
#     with client:
#         client.loop.run_until_complete(main())
