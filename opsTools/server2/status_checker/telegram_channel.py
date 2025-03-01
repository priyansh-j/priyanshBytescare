
from flask import Flask, request, Response
import csv
import io
from telethon.sync import TelegramClient
from telethon import functions, types

app = Flask(__name__)

# Telegram API credentials
api_id = '25538849'  # replace with your api_id
api_hash = '4468109211b1fc4f76ec4807dcaeba14'  # replace with your api_hash
phone_number = '+917791853026'  # replace with your phone number

async def search_telegram(client, query):
    offset = 0
    limit = 100
    all_results = []
    
    while True:
        result = await client(functions.contacts.SearchRequest(q=query, limit=limit))
        if not result.chats:
            break
        
        for chat in result.chats:
            if isinstance(chat, types.Channel):
                url = 'https://t.me/' + chat.username if chat.username else 'N/A'
                id_url = f'https://t.me/c/{chat.id}'
                all_results.append([id_url, chat.title, url])
        
        offset += len(result.chats)
        if len(result.chats) < limit:
            break

    return all_results

@app.route('/search', methods=['GET'])
async def search():
    query = request.args.get('query', default='', type=str)
    print(query)
    if query:
        client = TelegramClient(phone_number, api_id, api_hash)
        await client.start()
        results = await search_telegram(client, query)
        await client.disconnect()
        
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(['ID URL', 'Title', 'URL/Username'])
        cw.writerows(results)
        
        output = si.getvalue()
        return Response(output, mimetype='text/csv', headers={"Content-disposition": "attachment; filename=search_results.csv"})
    else:
        return "Please provide a query parameter", 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')







