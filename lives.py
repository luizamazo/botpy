import json 
import utils, utilsTwitter
import sys, os
import time
import random
from instagram_private_api import Client, ClientCompatPatch, ClientCookieExpiredError, ClientLoginRequiredError

user_name = "noctedaemones"
password = "letskillthislove"
#MEDIA_ID = '2331692048117583287'
arg = sys.argv[1:]
payload = arg[0]
payload = payload.split(',')
BOT_USER = payload[0]
BOT_NAME = payload[1]
cached_path = './ig-private-api/credentials.json'

try:
    cached_settings = utils.getCachedSettings(cached_path)
    device_id = cached_settings.get('device_id')
    #print('cached_settings', cached_settings)
    api = Client(user_name, password, settings=cached_settings, auto_patch=True)
except(ClientCookieExpiredError, ClientLoginRequiredError) as e:
    print('ClientCookieExpiredError/ClientLoginRequiredError: {0!s}'.format(e))
    #login expired, do relogin but use default ua, keys and such
    
def livesMaster():
    payload = checkForLives()
    isLive = payload[0]
    live = payload[1]
    lives_path = './instagram/lives/livesInfo.json'
    print(payload)
    if isLive == True:
        handleLiveInfo(live, lives_path)
    else: 
        print('PY: User isnt live on instagram')
            
def checkForLives():
    live = api.user_story_feed('29229686107')
    if live['broadcast'] == None: 
        isLive = False  
    else:
        isLive = True
    return isLive, live

def handleLiveInfo(live, lives_path):
    livesFile = utils.read_json(lives_path) 
    livesFile = livesFile[0] 
    if live['broadcast']['id'] != livesFile['live_id']:
        livesInfo = []
        livesInfo.append({
            "live_id": live['broadcast']['id'],
            "thumbnail": live['broadcast']['cover_frame_url'],
            "published_time": live['broadcast']['published_time']
        })
        utils.write_json(lives_path, livesInfo)  
        thumb_path = './media/user/thumbnail_live.jpeg'
        utils.download_image(thumb_path, live['broadcast']['cover_frame_url'])
        tweetLive()

def tweetLive():
    folder = "user"
    tweet = '[LIVE] ' + BOT_USER + ' is now live on instagram:\n\nhttps://www.instagram.com/'+ BOT_USER + '/live/ \n\n@marcabp #' + BOT_NAME
    media_ids = utilsTwitter.uploadMedia(folder, "thumbnail_live")
    utilsTwitter.sendTweet(folder, media_ids, tweet)
    print('PY: Tweet sent -> User is live on instagram')

livesMaster()



