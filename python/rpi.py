#!/usr/bin/env python

""" File to test PubNub """
from random import uniform
from random import randint
from time import sleep
from pubnub.pubnub import PubNub
from pubnub.pnconfiguration import PNConfiguration
from pubnub.exceptions import PubNubException
from ina219 import INA219
from ina219 import DeviceRangeError

# Pubnub config
PNCONFIG = PNConfiguration()
PNCONFIG.subscribe_key = "sub-c-1089702c-c016-11e7-97ca-5a9f8a2dd46d"
PNCONFIG.publish_key = "pub-c-d0429aa8-023b-4f06-9d6d-fb916ae807f1"
PNCONFIG.ssl = True
CHANNEL = "rpi"

PUBNUB = PubNub(PNCONFIG)

PUBNUB.subscribe().channels(CHANNEL).execute()

# ina219 config
SHUNT_OHMS = 0.1

def read_sensor():
    """ Function to configure and read the ina219 via I2C """
    ina = INA219(SHUNT_OHMS)
    ina.configure()
    ina_volts = ina.voltage()
    print("Bus Voltage: %.3f V" % ina_volts)
    try:
        ina_current = ina.current()
        ina_power = ina.power()
        ina_shunt_voltage = ina.shunt_voltage()

        print("Bus Current: %.3f mA" % ina_current)
        print("Power: %.3f mW" % ina_power)
        print("Shunt voltage: %.3f mV" % ina_shunt_voltage)
    except DeviceRangeError as error:
        # Current out of device range with specified shunt resister
        print(error)

    output_data = {
        'voltage': ina_volts,
        'current': ina_current,
        'power': ina_power
    }
    return output_data

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

def send_obj(obj, channel):
    """Send an object to a channel"""
    try:
        envelope = PUBNUB.publish().channel(channel).message(obj).sync()
        print("Publish timetoken: %d" % envelope.result.timetoken)
    except PubNubException as error:
        print("Error! Status: %s", error)

STATS = {
    'voltage': 0.0,
    'current': 0.0,
    'rpm0': 0,
    'rpm1': 0,
    'rpm2': 0,
}

def gen_rand_data(obj):
    """ Generate random data to put into the define object """
    obj['voltage'] = uniform(20, 30)
    obj['current'] = uniform(0, 20)
    obj['rpm0'] = randint(100, 2000)
    obj['rpm1'] = randint(100, 2000)
    obj['rpm2'] = randint(100, 1000)

def send_random():
    """ Generate and send random data """
    gen_rand_data(STATS)
    print(STATS)
    send_obj(STATS, CHANNEL)
    return

while True:
    print("Please select an option:\n")
    print("1. Manually send data\n2. Send random data\n3. Read the sensor")
    CHOICE = input("")
    if CHOICE == "1":
        send_data(get_data(), CHANNEL)
    elif CHOICE == "2":
        LOOPS = input('How much data should be sent?\n')
        if int(LOOPS) in range(100):
            for i in range(int(LOOPS)):
                print('Sending data: ', i+1)
                send_random()
                sleep(0.5)
        elif int(LOOPS) < 0:
            print("Can't be negative!")
        else:
            print("Try a smaller number")
    elif CHOICE == "3":
        print("Reading the sensor")
        SENSOR_DATA = read_sensor()
        send_obj(SENSOR_DATA, CHANNEL)
        sleep(1)
    else:
        print("Please select a valid option!")
            