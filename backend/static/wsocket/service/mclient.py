import asyncio
import datetime
import random
import json
import cbpro
from pymongo import MongoClient


mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client.cryptocurrency_database
BTC_collection = db.BTC_collection

wsClient = cbpro.WebsocketClient(url="wss://ws-feed.pro.coinbase.com", products="BTC-USD", 
    channels=["ticker"], mongo_collection=BTC_collection)

wsClient.start()

