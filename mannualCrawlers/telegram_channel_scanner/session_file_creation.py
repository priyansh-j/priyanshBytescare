from telethon.sync import TelegramClient

api_id = '25538849' # replace with your api_id
api_hash = '4468109211b1fc4f76ec4807dcaeba14'  # replace with your api_hash
phone_number ='+917791853026'  # replace with your new phone number


# # Telegram API credentials
# # api_id = '25538849'
# # api_hash = '4468109211b1fc4f76ec4807dcaeba14'
# # phone_number = '+917791853026'
client = TelegramClient(phone_number, api_id, api_hash)

async def main():
    await client.start()
    print("Client Created")
    # Ensure you're authorized
    if await client.is_user_authorized():
        print("User is authorized.")
    else:
        print("User is not authorized.")

if __name__ == '__main__':
    with client:
        client.loop.run_until_complete(main())

# This will create a session file named after your phone number in the current directory
