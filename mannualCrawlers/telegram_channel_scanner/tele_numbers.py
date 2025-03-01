import json
import asyncio
import os
from telethon import TelegramClient
from telethon.tl.functions.channels import GetParticipantsRequest
from telethon.tl.types import ChannelParticipantsSearch
from telethon.tl.types import PeerChannel

# Hard-coding API ID, API Hash, and phone number
api_id = '25538849'  # Replace with your API ID
api_hash = '4468109211b1fc4f76ec4807dcaeba14'  # Replace with your API Hash
phone = '+917791853026'  # Replace with your phone number

# Create the client and connect
client = TelegramClient('session_name', api_id, api_hash)

async def get_channel_participants(channel_url):
    try:
        # Get the channel entity from the URL or ID
        if channel_url.isdigit():
            entity = PeerChannel(int(channel_url))
        else:
            entity = channel_url

        my_channel = await client.get_entity(entity)

        # Fetch participants
        offset = 0
        limit = 100
        all_participants = []

        while True:
            participants = await client(GetParticipantsRequest(
                my_channel, ChannelParticipantsSearch(''), offset, limit, hash=0
            ))
            if not participants.users:
                break
            all_participants.extend(participants.users)
            offset += len(participants.users)

        # Collect user details
        all_user_details = []
        for participant in all_participants:
            all_user_details.append({
                "id": participant.id, "first_name": participant.first_name, "last_name": participant.last_name,
                "username": participant.username, "phone": participant.phone, "is_bot": participant.bot
            })

        # Ensure result folder exists
        if not os.path.exists('result'):
            os.makedirs('result')

        # Get the channel name for the file name
        channel_name = channel_url.split('/')[-1] + '1'
       # channel_name = my_channel.title.replace(" ", "_") if my_channel.title else 'unknown_channel'
        file_path = f'result/{channel_name}.json'

        # Save the user data to a JSON file named after the channel
        with open(file_path, 'w') as outfile:
            json.dump(all_user_details, outfile, indent=4)

        print(f"Data saved for channel: {channel_name}")

    except Exception as e:
        print(f"Error fetching participants for {channel_url}: {e}")

async def main(phone):
    await client.start()
    print("Client Created")

    # Ensure you're authorized
    if not await client.is_user_authorized():
        await client.send_code_request(phone)
        await client.sign_in(phone, input('Enter the code: '))

    # Example input: multiple channel URLs
    channel_urls = [
#         'https://t.me/Anime_Chat_Group_ACG',
# 'https://t.me/Global_Friends_Chat_Group',
# 'https://t.me/class10studymaterials8',
# 'https://t.me/quizgroupforall',
# 'https://t.me/akkPWianschat',
# 'https://t.me/tech_patelayush',
# 'https://t.me/udaan2024_002',
# 'https://t.me/chatchilln',
# 'https://t.me/class9th10',
# 'https://t.me/class_10_substudy',
# 'https://t.me/CLASS_10_DOUBT_GROUP',
# 'https://t.me/BeingPrajwalRajput',
# 'https://t.me/cuetleet',
# 'https://t.me/cuetbtech',
# 'https://t.me/upcetbtechleet2021',
# 'https://t.me/anime_chattings',
# 'https://t.me/allfreebooks',
# 'https://t.me/sahabjikiganit',
# 'https://t.me/Suscess_Study',
# 'https://t.me/Class10bookpdfs'

# 'https://t.me/allfreebooks'
# 'https://t.me/liquideofficial'
'https://t.me/wealthsecretofficial1'
    ]

    # Loop through each channel URL and get participants with a 10-second delay
    for channel_url in channel_urls:
        await get_channel_participants(channel_url)
        print(f"Waiting for 10 seconds before processing the next channel...")
        await asyncio.sleep(10)  # Add a 10-second delay

# Run the client
with client:
    client.loop.run_until_complete(main(phone))













# import json
# import asyncio
# from telethon import TelegramClient
# from telethon.tl.functions.channels import GetParticipantsRequest
# from telethon.tl.types import ChannelParticipantsSearch
# from telethon.tl.types import PeerChannel

# # Hard-coding API ID, API Hash, and phone number
# api_id = '25538849'   # Replace with your API ID
# api_hash = '4468109211b1fc4f76ec4807dcaeba14'  # Replace with your API Hash
# phone = '+917791853026'  # Replace with your phone number



# # Create the client and connect without username
# client = TelegramClient('session_name', api_id, api_hash)

# async def main(phone):
#     await client.start()
#     print("Client Created")

#     # Ensure you're authorized
#     if not await client.is_user_authorized():
#         await client.send_code_request(phone)
#         await client.sign_in(phone, input('Enter the code: '))

#     me = await client.get_me()

#     user_input_channel = input("Enter entity (telegram URL or entity id): ")

#     if user_input_channel.isdigit():
#         entity = PeerChannel(int(user_input_channel))
#     else:
#         entity = user_input_channel

#     my_channel = await client.get_entity(entity)

#     offset = 0
#     limit = 100
#     all_participants = []

#     while True:
#         participants = await client(GetParticipantsRequest(
#             my_channel, ChannelParticipantsSearch(''), offset, limit, hash=0
#         ))
#         if not participants.users:
#             break
#         all_participants.extend(participants.users)
#         offset += len(participants.users)

#     all_user_details = []
#     for participant in all_participants:
#         all_user_details.append(
#             {"id": participant.id, "first_name": participant.first_name, "last_name": participant.last_name,
#              "username": participant.username, "phone": participant.phone, "is_bot": participant.bot})

#     # Save the user data to a JSON file
#     with open('user_data.json', 'w') as outfile:
#         json.dump(all_user_details, outfile)

# # Run the client
# with client:
#     client.loop.run_until_complete(main(phone))















# from telethon.sync import TelegramClient
# import re

# # Your own API_ID and API_HASH
# API_ID = '25538849'  # replace with your api_id
# API_HASH ='4468109211b1fc4f76ec4807dcaeba14' 
# PHONE = '+917791853026'

# # Create a Telegram client
# client = TelegramClient('session_name', API_ID, API_HASH)

# # Start the client
# client.start(PHONE)

# # Telegram channel link (e.g., 'https://t.me/yashikadrops')
# channel_link = 'https://t.me/science_discussion10'

# # Extract the channel username from the link
# channel_username = channel_link.split('/')[-1]

# mobile_numbers = []

# async def scrape_all_numbers():
#     # Use a loop to retrieve all the messages
#     async for message in client.iter_messages(channel_username, limit=None):  # 'limit=None' gets all messages
#         if message.text:  # Check if there is text in the message
#             # Match and extract mobile numbers using regex
#             matches = re.findall(r'\+?\d{10,15}', message.text)
#             if matches:
#                 mobile_numbers.extend(matches)
        
#         # Check if the message contains media (documents, images, etc.)
#         if message.media:
#             try:
#                 if message.document:
#                     # Extract text from the document if needed (e.g., PDF or text files containing numbers)
#                     pass
#             except:
#                 pass  # Handle any errors when processing media

# with client:
#     client.loop.run_until_complete(scrape_all_numbers())

# # Remove duplicates if necessary
# unique_mobile_numbers = list(set(mobile_numbers))

# # Print scraped mobile numbers
# print(unique_mobile_numbers)

# # Save to a file (optional)
# with open('scraped_mobile_numbers.txt', 'w') as f:
#     for number in unique_mobile_numbers:
#         f.write(f"{number}\n")













# from telethon.sync import TelegramClient
# import re

# # Your own API_ID and API_HASH
# API_ID = '25538849'  # replace with your api_id
# API_HASH ='4468109211b1fc4f76ec4807dcaeba14' 
# PHONE = '+917791853026'

# # Create a Telegram client
# client = TelegramClient('session_name', API_ID, API_HASH)

# # Start the client
# client.start(PHONE)

# # Telegram channel link (e.g., 'https://t.me/yashikadrops')
# channel_link = 'https://t.me/yashikadrops'

# # Extract the channel username from the link
# channel_username = channel_link.split('/')[-1]

# mobile_numbers = []

# async def scrape_numbers():
#     async for message in client.iter_messages(channel_username):
#         # Extract mobile numbers using regex
#         matches = re.findall(r'\+?\d{10,15}', message.text or '')
#         if matches:
#             mobile_numbers.extend(matches)

# with client:
#     client.loop.run_until_complete(scrape_numbers())

# # Print scraped mobile numbers
# print(mobile_numbers)