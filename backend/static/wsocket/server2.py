import asyncio
import datetime
import random
import websockets
import json
import cbpro

cache = []
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
                "\t@ {}".format(msg["last_size"])
                )
            
            cache.append({
                "price" : msg["price"],
                "time" : msg["time"],
                "side" : msg["side"]
            })
        if len(cache) > 100:
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

start_server = websockets.serve(time, "127.0.0.1", 5678)

loop.run_until_complete(start_server)
loop.run_forever()