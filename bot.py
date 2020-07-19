import tweepy 
import os 
import sys
import time
from settings import config
import pathlib
import json, re
import shutil
import utils, utilsTwitter

auth = tweepy.OAuthHandler(config.consumer_key, config.consumer_secret)
auth.set_access_token(config.access_token, config.access_token_secret)
api = tweepy.API(auth)
arg = sys.argv[1:]
tweet = arg[0]

if len(sys.argv) > 2: 
    storyName = sys.argv[2]
    print('PY: Entrou no arg de Stories')
    
folder = 'null'
isIGTV = False 

if "POST" in tweet:
    folder = "posts"
elif "IGTV" in tweet: 
    isIGTV = True
    folder = "posts"
elif "STORIES" in tweet:
    folder = "stories"

def master():
    
    if isIGTV == True: 
        print('PY: Its IGTV')
        filePath = utils.getFileFromMediaFolder(folder, 'thumbnail')
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]      
        print('PY: IGTV THUMB to be tweeted', filePath) 
        utilsTwitter.sendTweet(folder, media_ids, tweet)
    elif folder == "posts":
        media = utils.getMediaFromFolder(folder)
        print('PY: Media from folder', media)
        utilsTwitter.tweetPosts(folder, media, tweet)
    elif folder == "stories":
        filePath = utils.getFileFromMediaFolder(folder, storyName)
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]      
        print('PY: Story to be tweeted', filePath) 
        utilsTwitter.sendTweet(folder, media_ids, tweet, storyName)
        print('PY: Tweeted story, proceeds or ends')
   
def teste():
    print('i')

#teste()           
master()