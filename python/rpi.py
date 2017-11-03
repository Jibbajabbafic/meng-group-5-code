""" File to test PubNub """
from pubnub.pubnub import PubNub
from pubnub.pnconfiguration import PNConfiguration
from pubnub.exceptions import PubNubException
PNCONFIG = PNConfiguration()
PNCONFIG.subscribe_key = "sub-c-1089702c-c016-11e7-97ca-5a9f8a2dd46d"
PNCONFIG.publish_key = "pub-c-d0429aa8-023b-4f06-9d6d-fb916ae807f1"
PNCONFIG.ssl = True
CHANNEL = "rpi"

PUBNUB = PubNub(PNCONFIG)

PUBNUB.subscribe().channels(CHANNEL).execute()

def get_data():
    """ Get data as input and return it"""
    data = input('What data should be sent?\n')
    return data

def send_data(data, channel):
    """Send some data to a channel"""
    try:
        envelope = PUBNUB.publish().channel(channel).message({
            'data': data
        }).sync()
        print("publish timetoken: %d" % envelope.result.timetoken)
    except PubNubException as error:
        print("Error! Status: %s", error)

while True:
    send_data(get_data(), CHANNEL)
