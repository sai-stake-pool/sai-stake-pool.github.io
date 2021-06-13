import asyncio
import datetime
import random
import websockets
import json
import cbpro
import rx
from rx.scheduler import ThreadPoolScheduler
from rx import operators as ops
from rx import create

from pymongo import MongoClient
import dateutil.parser

cache = []

mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client.cryptocurrency_database
# BTC_collection = db.BTC_collection
ACC_collection = db.ACC_collection 
ACC_collection_buy = db.ACC_collection_buy 
ACC_collection_sell = db.ACC_collection_sell

class MyWebsocketClient(cbpro.WebsocketClient):

    def on_open(self):
        # self.url = "wss://ws-feed-public.sandbox.pro.coinbase.com"
        self.url = "wss://ws-feed.pro.coinbase.com"        
        self.products = ["BTC-USD"]
        self.message_count = 0
        self.channels = ["ticker"]
        print("Lets count the messages!")

    def on_message(self, msg):
        # print(msg)
        self.message_count += 1
        if 'price' in msg and 'type' in msg:
            print ("Message type:", msg["type"],
                "\t@ {:.3f}".format(float(msg["price"])),
                "\t@ {}".format(msg["side"]),
                "\t@ {}".format(msg["last_size"]),
                "\t@ {}".format(msg["time"])
                )



            print("executing...")
            price = float(msg["price"])
            size = float(msg["last_size"])     

            dt = dateutil.parser.isoparse(msg["time"])
            dt = dt.replace(second=0, microsecond=0) 

            # ACC_collection.find_one_and_update({ "price" : price, "datetime" : dt },
            #     {"$inc":
            #         {"size": size}
            #     },upsert=True)

            if msg["side"] == "buy":
                # ACC_collection_buy.find_one_and_update({ "price" : price, "datetime" : dt },
                #     {"$inc":
                #         {"size": size}
                #     },upsert=True)
                ACC_collection.find_one_and_update({ "price" : price, "datetime" : dt },
                    {"$inc":
                        {"buy_size": size, "sell_size" : 0}
                    },upsert=True)

                    
            if msg["side"] == "sell":
                # ACC_collection_sell.find_one_and_update({ "price" : price, "datetime" : dt },
                #     {"$inc":
                #         {"size": size * -1}
                #     },upsert=True)                
                ACC_collection.find_one_and_update({ "price" : price, "datetime" : dt },
                    {"$inc":
                        {"buy_size": 0, "sell_size" : size * -1}
                    },upsert=True) 
           
            cache.append({
                "price" : msg["price"],
                "time" : msg["time"],
                "side" : msg["side"]
            })
        if len(cache) > 100000:
            cache.pop(-1)

    def on_close(self):
        print("-- Goodbye! --")

wsClient = MyWebsocketClient()
wsClient.start()  

loop = asyncio.get_event_loop()


async def time(websocket, path):

    try:
        while True:
            print(len(cache))
            if len(cache) > 0:
                msg = cache.pop(0)
                print("msg %s" % msg)
                await websocket.send(json.dumps(msg))
            else:
                await asyncio.sleep(random.random() * 3)

    except KeyboardInterrupt:
        wsClient.close()
        loop.close()      



start_server = websockets.serve(time, "0.0.0.0", 5678)

loop.run_until_complete(start_server)
loop.run_forever()