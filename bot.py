import tweepy 
import os 
import sys
import time
from settings import config
import pathlib

auth = tweepy.OAuthHandler(config.consumer_key, config.consumer_secret)
auth.set_access_token(config.access_token, config.access_token_secret)
#print(pathlib.Path(mediaPath).suffix) pra pegar o tipo de arquivo - extensão
api = tweepy.API(auth)
#arg = sys.argv
arg = 'defegrgth'
#arg = sys.argv[1:]

def getMediaFromFolder():
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media')
    print('dir', mediaFolder)

    media_list = [] #array that contains path 
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            media_list.append(os.path.join(dirpath, f))
    return media_list

def master(): 
    media = getMediaFromFolder()
    mediaIdImages = []
    mediaIdVideo = []
    tweet_id = ''
    for index, path in enumerate(media, start = 1):
        #mediaIdStrings.append(mediaUploaded.media_id_string)
        mediaPath = path
        mediaUploaded = api.upload_chunked(mediaPath)
        print('indeeex', index)
        print('mediaoath', len(media))
        print('lengh', len(mediaIdImages))
        if hasattr(mediaUploaded, 'video'):  
            
            if len(mediaIdImages) > 0 and len(mediaIdImages) < 4:
                if tweet_id == '':
                    sentTweet = api.update_status(
                    status = 'cfhyuju', 
                    media_ids = mediaIdImages
                )
                else: 
                    sentTweet = api.update_status(
                        status = 'fefgrgtyh', 
                        in_reply_to_status_id = tweet_id,
                        auto_populate_reply_metadata = True,
                        media_ids = mediaIdImages
                    )    
                tweet_id = sentTweet.id_str
                mediaIdImages = []
                print('tweetid', tweet_id)
            mediaIdVideo.append(mediaUploaded.media_id_string)
            
            if('1 -' in mediaPath):
                sentTweet = api.update_status(
                    status ='ds',
                    media_ids = mediaIdVideo
                )
            else:
                sentTweet = api.update_status(
                    status = 'yyy', 
                    in_reply_to_status_id = tweet_id,
                    auto_populate_reply_metadata = True,
                    media_ids = mediaIdVideo
                )  
            tweet_id = sentTweet.id_str
            mediaIdVideo = []
        else:
            mediaIdImages.append(mediaUploaded.media_id_string)

        if len(mediaIdImages) == 4:
            if tweet_id == '':
                sentTweet = api.update_status(
                    status = 'aaa', 
                    media_ids = mediaIdImages
                )
            else: 
                sentTweet = api.update_status(
                    status = 'ssas', 
                    in_reply_to_status_id = tweet_id,
                    auto_populate_reply_metadata = True,
                    media_ids = mediaIdImages
                )
            tweet_id = sentTweet.id_str
            mediaIdImages = []

        if index == len(media):
            if tweet_id == '': 
                sentTweet = api.update_status(
                    status = 'xcxc', 
                    media_ids = mediaIdImages
                )
            else: 
                sentTweet = api.update_status(
                    status = 'asasadaefr', 
                    in_reply_to_status_id = tweet_id,
                    auto_populate_reply_metadata = True,
                    media_ids = mediaIdImages
                )

def verifyTweetOrder(tweet_id, mediaId):
    if tweet_id == '': 
        sentTweet = api.update_status(
            status = arg, 
            media_ids = mediaId
        )
    else: 
        sentTweet = api.update_status(
            status = arg, 
            in_reply_to_status_id = tweet_id,
            auto_populate_reply_metadata = True,
            media_ids = mediaId
        )
    return sentTweet.id_str
    
def teste():
    print(arg)

#teste()           
master()

