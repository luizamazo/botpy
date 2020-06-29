import tweepy 
import os 
import sys
import time
from settings import config
import pathlib
import json, re
import shutil

auth = tweepy.OAuthHandler(config.consumer_key, config.consumer_secret)
auth.set_access_token(config.access_token, config.access_token_secret)
api = tweepy.API(auth)

def teste(tweet):
    print('finge q enviou o tweet', tweet)
            
def sendTextTweet(tweet):
    count = 0
    maxTries = 5
    while True: 
        try:
            print('PY: Entered sendTextTweet try ->')
            sent_tweet = api.update_status(
                status = tweet
            )
            return sent_tweet
        except tweepy.TweepError as error:
            count += 1
            print('Error sending tweet ->', error)
            if count == maxTries:
                raise