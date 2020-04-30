import tweepy 
import os 
import sys
import time
from settings import config
import pathlib
import json, re

auth = tweepy.OAuthHandler(config.consumer_key, config.consumer_secret)
auth.set_access_token(config.access_token, config.access_token_secret)
#print(pathlib.Path(mediaPath).suffix) pra pegar o tipo de arquivo - extensão
api = tweepy.API(auth)
#arg = sys.argv
#arg = 'defegrgth'
arg = sys.argv[1:]
tweet = arg[0]
#tweet = tweet.encode('utf-16', 'surrogatepass').decode('utf-16')

def getMediaFromFolder(folder):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    print('getMediaFromFolder', mediaFolder)

    media_list = [] #array that contains path 
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            media_list.append(os.path.join(dirpath, f))
    return media_list

def getFileFromMediaFolder(folder, fileName):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            print('file', f)
            if fileName in f:
                mediaPath = os.path.join(dirpath, f)
    return mediaPath

def master():
    
    if "POST" in tweet:
        folder = "posts"
    elif "STORIES" in tweet:
        folder = "stories"
    
    print('folder', folder)
    
    if folder == "posts":
        media = getMediaFromFolder(folder)
        print('media', media)
        tweetPosts(media)
    else:
        storyName = sys.argv[2]
        print('storyName do py', storyName)
        filePath = getFileFromMediaFolder(folder, storyName)
        mediaUploaded = api.upload_chunked(filePath)
        media_ids = [mediaUploaded.media_id_string]      
        print('filePath', filePath)
        #sentTweet = api.update_status(
         #   status = tweet, 
        #    media_ids = media_ids
       # )
        print('tweetou vai pro proximo')

def tweetPosts(media):
    mediaIdImages = []
    mediaIdVideo = []
    tweet_id = ''
    for index, path in enumerate(media, start = 1):
            mediaPath = path
            mediaUploaded = api.upload_chunked(mediaPath)
            print('mediaUploaded', mediaUploaded)
            if hasattr(mediaUploaded, 'video'):  
                if len(mediaIdImages) > 0 and len(mediaIdImages) < 4:
                    print('eh video, mas tem img antes de 4, primeiro da thread')
                    if tweet_id == '':
                        sentTweet = api.update_status(
                            status = tweet, 
                            media_ids = mediaIdImages
                        )
                    else: 
                        print('tem < 4 antes desse video, faz parte de thread')
                        sentTweet = api.update_status(
                            status = tweet, 
                            in_reply_to_status_id = tweet_id,
                            auto_populate_reply_metadata = True,
                            media_ids = mediaIdImages
                        ) 
                        
                    tweet_id = sentTweet.id_str
                    mediaIdImages = []
                    
                mediaIdVideo.append(mediaUploaded.media_id_string)
                
                if('1 -' in mediaPath):
                    print('eh o primeiro video da sequencia')
                    sentTweet = api.update_status(
                        status = tweet,
                        media_ids = mediaIdVideo
                    )
                else:
                    print('video faz parte de thread')
                    sentTweet = api.update_status(
                        status = tweet, 
                        in_reply_to_status_id = tweet_id,
                        auto_populate_reply_metadata = True,
                        media_ids = mediaIdVideo
                    )  
                tweet_id = sentTweet.id_str
                mediaIdVideo = []
            else:
                print('eh ibagem, adiciona no array')
                mediaIdImages.append(mediaUploaded.media_id_string)
                print('array de ibagens', mediaIdImages)

            if len(mediaIdImages) == 4:
                print('completou 4 imagens')
                if tweet_id == '':
                    print('quatro imgs sao as primeiras')
                    sentTweet = api.update_status(
                        status = tweet, 
                        media_ids = mediaIdImages
                    )
                else: 
                    print('quatro imgs fazem parte de thread')
                    sentTweet = api.update_status(
                        status = tweet, 
                        in_reply_to_status_id = tweet_id,
                        auto_populate_reply_metadata = True,
                        media_ids = mediaIdImages
                    )
                tweet_id = sentTweet.id_str
                mediaIdImages = []

            if index == len(media):
                print('chegou no fim onde index e numero de media sao mesmo numero', len(media))
                if mediaIdImages != []: 
                    if tweet_id == '':
                        print('posta o restante como primeiro tweet')
                        sentTweet = api.update_status(
                            status = tweet, 
                            media_ids = mediaIdImages
                    )
                    else: 
                        print('posta o restante que faz parte de thread')
                        sentTweet = api.update_status(
                            status = tweet, 
                            in_reply_to_status_id = tweet_id,
                            auto_populate_reply_metadata = True,
                            media_ids = mediaIdImages
                        )
                
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
    
def teste():
    print('i')

#teste()           
master()

