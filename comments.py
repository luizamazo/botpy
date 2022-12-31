import json 
import utils, utilsTwitter
import sys, os
import time
from random import randrange
import random
from instagram_private_api import Client, ClientCompatPatch, ClientCookieExpiredError, ClientLoginRequiredError


user_name = "noctedaemones"
password = "letskillthislove"
#arg = sys.argv[1:]
#payload = arg[0]
#payload = payload.split(',')
#BOT_USER = payload[0]
#POST_URL = payload[1]
#BOT_NAME = payload[2]
#MEDIA_ID = payload[3]
BOT_USER = 'baerserk'
BOT_NAME = 'botzinho'
POST_URL = 'post url'
MEDIA_ID = '2310442419067662884'
print(BOT_USER, POST_URL, BOT_NAME, MEDIA_ID)

cached_path = './ig-private-api/credentials.json'

try:
    cached_settings = utils.getCachedSettings(cached_path)
    device_id = cached_settings.get('device_id')
    #print('cached_settings', cached_settings)
    api = Client(user_name, password, settings=cached_settings, auto_patch=True)
except(ClientCookieExpiredError, ClientLoginRequiredError) as e:
    print('ClientCookieExpiredError/ClientLoginRequiredError: {0!s}'.format(e))
    #login expired, do relogin but use default ua, keys and such

def commentsMaster():
    comments = api.media_n_comments(MEDIA_ID, n=50)
    file_path = './instagram/comments/comments [' + MEDIA_ID + '].json'
    utils.write_json(file_path, comments)
    searchAndWriteRelevantComments(MEDIA_ID)
    tweetRelevantComments()
    
def searchAndWriteRelevantComments(MEDIA_ID):
    comments_path = './instagram/comments/comments [' + MEDIA_ID + '].json'
    relevantUsers_path = './instagram/comments/relevantUsers.json'
    commentsToPost_path= './instagram/comments/commentsToPost [' + MEDIA_ID + '].json'
    
    commentsLoad = utils.read_json(comments_path)
    usersLoad = utils.read_json(relevantUsers_path)
    
    commentsToPost = []
    
    for comments in commentsLoad:
        for user in usersLoad:
            if comments['user']['username'] == user:
                commentsToPost.append(comments) 
    utils.write_json(commentsToPost_path, commentsToPost)

def tweetRelevantComments():
    commentsToPost_path= './instagram/comments/commentsToPost [' + MEDIA_ID + '].json'    
    commentsPosted_path= './instagram/comments/commentsPosted [' + MEDIA_ID + '].json'    
    
    commentsToPostLoad = utils.read_json(commentsToPost_path)
    isFileEmpty = utils.verifyIfFileIsEmpty(commentsPosted_path)
    
    if isFileEmpty == False: 
        commentsPostedLoad = utils.read_json(commentsPosted_path)
    else: 
        wasPosted = False
   
    for comment in commentsToPostLoad:
        comment_type = comment['type']
        if isFileEmpty == False:
            wasPosted = verifyIfCommentWasAlreadyPosted(comment)
        if wasPosted == False: 
            username = comment['user']['username']
            if comment_type == 0:
                text = comment['text']
                tweet = '[COMMENT] ' + username + ' commented on ' + BOT_USER + "'s post:\n\n" + text + '\n\n' + POST_URL + ' #' + BOT_NAME
            elif comment_type == 2:
                text = comment['text']
                text = text.replace('@', '@.')
                tweet = '[COMMENT] ' + username + ' replied:\n\n' + text + '\n\n' + POST_URL + ' #' + BOT_NAME 
            print(tweet)
            utilsTwitter.sendTextTweet(tweet)
            if isFileEmpty == False:
                utils.overwrite_json(commentsPosted_path, comment)
            else:
                commentsPosted = []
                commentsPosted.append(comment)
                utils.write_json(commentsPosted_path, commentsPosted)
                isFileEmpty = utils.verifyIfFileIsEmpty(commentsPosted_path)
               
        else:
            print('No new relevant comments to post')          

def verifyIfCommentWasAlreadyPosted(commentToPost):
    commentsPosted_path= './instagram/comments/commentsPosted [' + MEDIA_ID + '].json'
    if os.stat(commentsPosted_path).st_size != 0:
        commentsPostedLoad =  utils.read_json(commentsPosted_path)
        for commentsPosted in commentsPostedLoad:
            if commentsPosted['text'] == commentToPost['text']:
                wasPosted = True 
                return wasPosted
            else:
                wasPosted = False
    else:
        wasPosted = False
    return wasPosted

commentsMaster()
#comments = web_api.media_n_comments(2331692048117583287, n=20)


