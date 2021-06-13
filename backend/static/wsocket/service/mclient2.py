import asyncio
import datetime
import random
import json
import cbpro
from pymongo import MongoClient
import dateutil.parser

mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client.cryptocurrency_database
BTC_collection = db.BTC_collection2


class MyWebsocketClient(cbpro.WebsocketClient):
    
    def on_open(self):
        self.url = "wss://ws-feed.pro.coinbase.com"        
        self.products = ["BTC-USD"]
        self.message_count = 0
        self.channels = ["ticker"]
        print("opened")

    def on_message(self, msg):
        # print(msg)

        if msg['type'] == 'ticker':
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

            BTC_collection.insert_one({
                "datetime" : dt,
                "price" : price,
                "size" : size,
                "side" : msg["side"]
            })

    def on_close(self):
        print("-- Goodbye! --")


wsClient = MyWebsocketClient()
wsClient.start()  