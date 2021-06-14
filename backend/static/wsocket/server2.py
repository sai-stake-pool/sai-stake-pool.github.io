import asyncio
import datetime
import random
import websockets
import json
import cbpro

cache = []


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