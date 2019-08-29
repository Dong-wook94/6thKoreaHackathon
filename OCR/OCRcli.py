import sys
from websocket import create_connection

#car_num = "34다2345"
car_num = sys.argv[1]
ws = create_connection("ws://52.78.134.52:9000/")
print("connect")
ws.send("car_num:"+car_num)
print("send car_num")
ws.close()


