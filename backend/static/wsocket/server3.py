import threading as th
import time
import keyboard

import asyncio
import datetime
import random
import websockets

import cbpro
import sys


cache = []
class MyWebsocketClient(cbpro.WebsocketClient):
    def on_open(self):
        self.url = "wss://ws-feed-public.sandbox.pro.coinbase.com"
        self.products = ["BTC-USD"]
        self.message_count = 0
        self.channels = ["ticker"]
        print("Lets count the messages!")

    def on_message(self, msg):
        self.message_count += 1
        if 'price' in msg and 'type' in msg:
            print ("Message type:", msg["type"],
                "\t@ {:.3f}".format(float(msg["price"])))
        cache.append(msg)
        if len(cache) > 100:
            cache.pop(-1)
            print("removing one... %s" % len(cache))

    def on_close(self):
        print("-- Goodbye! --")


wsClient = MyWebsocketClient()
wsClient.start()      

loop = asyncio.get_event_loop()

keep_going = True
def key_capture_thread():
    global keep_going
    a = keyboard.read_key()
    if a== "esc":
        keep_going = False


async def do_stuff():
    th.Thread(target=key_capture_thread, args=(), name='key_capture_thread', daemon=True).start()
    while keep_going:
        if len(cache) > 0:
            msg = cache.pop(0)
            await websocket.send(msg)
        else:
            await asyncio.sleep(random.random() * 3)
    print ("End")
    wsClient.close()
    loop.close()
    sys.exit()

start_server = websockets.serve(do_stuff, "127.0.0.1", 5678)

loop.run_until_complete(start_server)
# loop.run_forever()