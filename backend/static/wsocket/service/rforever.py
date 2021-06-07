import asyncio
import cbpro
from pymongo import MongoClient

async def work():
    mongo_client = MongoClient('mongodb://localhost:27017/')
    db = mongo_client.cryptocurrency_database
    BTC_collection = db.BTC_collection

    wsClient = cbpro.WebsocketClient(url="wss://ws-feed.pro.coinbase.com", products="BTC-USD", 
        channels=["ticker"], mongo_collection=BTC_collection)

    wsClient.start()        
    await asyncio.sleep(1)
    print("Task Executed")

loop = asyncio.get_event_loop()
try:
    asyncio.ensure_future(work())
    loop.run_forever()
except KeyboardInterrupt:
    pass
finally:
    print("Closing Loop")
    loop.close()