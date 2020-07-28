import tweepy 
import os 
import utils
import requests, shutil
from settings import config
import pathlib
import json, re
import shutil

auth = tweepy.OAuthHandler(config.consumer_key, config.consumer_secret)
auth.set_access_token(config.access_token, config.access_token_secret)
api = tweepy.API(auth)

def teste(tweet): 
    print('finge q enviou o tweet', tweet)

def uploadMedia(folder, fileName):
    filePath = utils.getFileFromMediaFolder(folder, fileName)
    mediaUploaded = api.upload_chunked(filePath)
    media_ids = [mediaUploaded.media_id_string]
    return media_ids

def sendTweet(folder, media_ids, tweet, storyName=None):
    count = 0
    maxTries = 5
    while True: 
        try:
            print('PY: Entered sendTweet try ->', folder)
            sent_tweet = api.update_status(
                status = tweet,
                media_ids = media_ids
            )
            return sent_tweet
        except tweepy.TweepError as error:
            count += 1
            print('Error sending tweet ->', error)
            if count == maxTries:
                if folder == "posts":
                    utils.deleteMediaFromFolder('media/', folder)
                elif folder == "stories":
                    utils.deleteFileFromFolder(folder, storyName)
                raise
            
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
            
def sendReply(previous_tweet_id, media_ids, tweet, folder):
    count = 0
    maxTries = 5
    while True: 
        try:
            print('PY: Entered sendReply try ->')
            sent_tweet = api.update_status(
                status = tweet, 
                in_reply_to_status_id = previous_tweet_id,
                auto_populate_reply_metadata = True,
                media_ids = media_ids
            )
            return sent_tweet
        except tweepy.TweepError as error:
            count += 1
            print('Error sending tweet ->', error)
            if count == maxTries:
                if folder == "posts":
                    utils.deleteMediaFromFolder('media/', folder)
                raise
            
def verifyTweetOrder(tweet_id, media_id, tweet):
    if tweet_id == '': 
        sentTweet = api.update_status(
            status = tweet, 
            media_ids = media_id
        )
    else: 
        sentTweet = api.update_status(
            status = tweet, 
            in_reply_to_status_id = tweet_id,
            auto_populate_reply_metadata = True,
            media_ids = media_id
        )
    return sentTweet.id_str

           
def tweetPosts(folder, media, tweet):
    mediaIdImages = []
    mediaIdVideo = []
    tweet_id = ''
    for index, path in enumerate(media, start = 1):
            mediaPath = path
            print('PY: Method Tweet Posts -> MediaPath ->', mediaPath)
            mediaUploaded = api.upload_chunked(mediaPath)
       
            if hasattr(mediaUploaded, 'video'):  
                if len(mediaIdImages) > 0 and len(mediaIdImages) < 4:
                    print('PY: Theres less than 4 images but the next media is a video, so tweet')
                    if tweet_id == '':
                        print('PY: Its the first tweet')
                        sentTweet = sendTweet(folder, mediaIdImages, tweet)
                    else: 
                        print('PY: It belongs to a thread')
                        sentTweet = sendReply(tweet_id, mediaIdImages, tweet, folder)
                        
                    tweet_id = sentTweet.id_str
                    mediaIdImages = []
                    
                mediaIdVideo.append(mediaUploaded.media_id_string)
                
                if('1 -' in mediaPath):
                    print('PY: Video is the first tweet')
                    sentTweet = sendTweet(folder, mediaIdVideo, tweet)
                else:
                    print('PY: Video belongs to a thread')
                    sentTweet = sendReply(tweet_id, mediaIdVideo, tweet, folder)
                    
                tweet_id = sentTweet.id_str
                mediaIdVideo = []
            else:
                print('PY: Its a picture, add it to array')
                mediaIdImages.append(mediaUploaded.media_id_string)
                print('PY: Array of images:', mediaIdImages)

            if len(mediaIdImages) == 4:
                print('PY: Theres already 4 images to tweet')
                if tweet_id == '':
                    print('PY: 4 images are the first tweet')
                    sentTweet = sendTweet(folder, mediaIdImages, tweet)
                else: 
                    print('PY: 4 images belongs to a thread')
                    sentTweet = sendReply(tweet_id, mediaIdImages, tweet, folder)
                    
                tweet_id = sentTweet.id_str
                mediaIdImages = []

            if index == len(media):
                print('PY: End of index, both index and lenght of media are ', len(media))
                if mediaIdImages != []: 
                    if tweet_id == '':
                        print('PY: Posts the rest as a tweet')
                        sentTweet = sendTweet(folder, mediaIdImages, tweet)
                    else: 
                        print('PY: Posts the rest as a tweet from a thread')
                        sentTweet = sendReply(tweet_id, mediaIdImages, tweet, folder)