import asyncio
import datetime
import random
import json
import cbpro
from pymongo import MongoClient
import dateutil.parser
import threading


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
            print("Message type:", msg["type"],
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
                "datetime": dt,
                "price": price,
                "size": size,
                "side": msg["side"]
            })

    def on_interrupted(self, task):
        # initializing the event object
        self.e = threading.Event()

        # starting the thread
        thread1 = threading.Thread(name='Event-Blocking-Thread', target=task, args=(self.e,86100))
        thread1.start()

    def on_close(self):
        self.e.set()
        print("-- Goodbye! --")
        
wsClient = MyWebsocketClient()

def task(event, timeout):
    print("Started thread but waiting for event...")
    # make the thread wait for event with timeout set
    event_set = event.wait(timeout)
    if event_set:
        print("Event received, releasing thread...")
        wsClient.start()
    else:
        print("Time out, moving ahead without event...")
        wsClient.start()

wsClient.on_interrupted(task)
wsClient.start()

print("displaying message after starting")
print("Is this the end")
      
