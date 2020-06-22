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
elif "profile pic" in tweet:
    folder = "user"

def getMediaFromFolder(folder):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    media_list = [] 
    print('VNFENRRO.', mediaFolder)
 
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            if folder == "posts":                    
                fileName = os.path.join(dirpath, f)
                print('fileName', fileName)
                media_list.append(fileName)
                print('media_list no if', media_list)
            elif folder == "stories":
                fileName = os.path.join(dirpath, f).replace('media/stories\\', '')
                media_list.append(fileName)
            elif folder == "user":
                fileName = os.path.join(dirpath, f).replace('media/user\\', '')
                media_list.append(fileName)
    print('PY: mediaFromFolder ->', media_list)
    return media_list

def getFileFromMediaFolder(folder, fileName):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            print('PY: getFileFromMediaFolder ->', f)
            if fileName in f:
                mediaPath = os.path.join(dirpath, f)
    return mediaPath

def master():
    
    if isIGTV == True: 
        print('PY: Its IGTV')
        filePath = getFileFromMediaFolder(folder, 'thumbnail')
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]      
        print('PY: IGTV THUMB to be tweeted', filePath) 
        sendTweet(media_ids)
    elif folder == "posts":
        media = getMediaFromFolder(folder)
        print('PY: Media from folder', media)
        tweetPosts(media)
    elif folder == "stories":
        filePath = getFileFromMediaFolder(folder, storyName)
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]      
        print('PY: Story to be tweeted', filePath) 
        sendTweet(media_ids)
        print('PY: Tweeted story, proceeds or ends')
    elif folder == "user":
        print('PY: Tweet new profile pic')
        filePath = getFileFromMediaFolder(folder, "profile_pic")
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]
        sendTweet(media_ids)
    else:
        print('PY: Tweeting updated user profile data')
        print('tweet->', tweet)
        sendTextTweet()

def tweetPosts(media):
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
                        sentTweet = sendTweet(mediaIdImages)
                    else: 
                        print('PY: It belongs to a thread')
                        sentTweet = sendReply(tweet_id, mediaIdImages)
                        
                    tweet_id = sentTweet.id_str
                    mediaIdImages = []
                    
                mediaIdVideo.append(mediaUploaded.media_id_string)
                
                if('1 -' in mediaPath):
                    print('PY: Video is the first tweet')
                    sentTweet = sendTweet(mediaIdVideo)
                else:
                    print('PY: Video belongs to a thread')
                    sentTweet = sendReply(tweet_id, mediaIdVideo)
                    
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
                    sentTweet = sendTweet(mediaIdImages)
                else: 
                    print('PY: 4 images belongs to a thread')
                    sentTweet = sendReply(tweet_id, mediaIdImages)
                    
                tweet_id = sentTweet.id_str
                mediaIdImages = []

            if index == len(media):
                print('PY: End of index, both index and lenght of media are ', len(media))
                if mediaIdImages != []: 
                    if tweet_id == '':
                        print('PY: Posts the rest as a tweet')
                        sentTweet = sendTweet(mediaIdImages)
                    else: 
                        print('PY: Posts the rest as a tweet from a thread')
                        sentTweet = sendReply(tweet_id, mediaIdImages)
                        
def sendTweet(media_ids):
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
                    deleteMediaFromFolder()
                elif folder == "stories":
                    deleteFileFromFolder()
                raise
            
def sendTextTweet():
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

def sendReply(previous_tweet_id, media_ids):
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
                    deleteMediaFromFolder()
                raise
                
def verifyTweetOrder(tweet_id, mediaId):
    if tweet_id == '': 
        sentTweet = api.update_status(
            status = tweet, 
            media_ids = mediaId
        )
    else: 
        sentTweet = api.update_status(
            status = tweet, 
            in_reply_to_status_id = tweet_id,
            auto_populate_reply_metadata = True,
            media_ids = mediaId
        )
    return sentTweet.id_str

def deleteMediaFromFolder():
    dir = os.path.dirname(__file__)
    path = os.path.join(dir, 'media/' + folder)
    print(path)
    shutil.rmtree(path) 
    os.mkdir(path)
    
def deleteFileFromFolder():
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            if storyName in f:
                print('Deleting file ->', os.path.join(dirpath, f))
                os.remove(os.path.join(dirpath, f))
   
def teste():
    print('i')

#teste()           
master()