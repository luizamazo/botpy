import json 
import utils
import sys, os
import time
from random import randrange
from instagram_private_api import Client, ClientCompatPatch

user_name = "noctedaemones"
password = "letskillthislove"
#MEDIA_ID = '2331692048117583287'
arg = sys.argv[1:]
payload = arg[0]
payload = payload.split(',')
BOT_USER = payload[0]
POST_URL = payload[1]
BOT_NAME = payload[2]
MEDIA_ID = payload[3]
print(BOT_USER, POST_URL, BOT_NAME)

interval = randrange(1,10)
print('interval', interval)
time.sleep(interval)
api = Client(user_name, password, auto_patch=True)

def commentsMaster():
    comments = api.media_n_comments(MEDIA_ID, n=10)
    file_path = './instagram/comments/comments [' + MEDIA_ID + '].json'
    write_json(file_path, comments)
    searchAndWriteRelevantComments(MEDIA_ID)
    tweetRelevantComments()

def write_json(file_path, comments):
    with open(file_path, 'w') as outfile:
        print('writing file to', file_path)
        json.dump(comments, outfile)
    outfile.close()
    print("writing done")

def read_json(file_path):
    with open(file_path) as json_file:
        result = json.load(json_file)
    json_file.close()
    print("reading done")
    return result

def overwrite_json(file_path, comment):
    with open(file_path, 'r+') as json_file:
        result = json.load(json_file)
        result.append(comment)
        json_file.seek(0)
        json.dump(result, json_file)
    json_file.close()
    print("overwriting done")
    return result
   
    
def searchAndWriteRelevantComments(MEDIA_ID):
    comments_path = './instagram/comments/comments [' + MEDIA_ID + '].json'
    relevantUsers_path = './instagram/comments/relevantUsers.json'
    commentsToPost_path= './instagram/comments/commentsToPost [' + MEDIA_ID + '].json'
    
    commentsLoad = read_json(comments_path)
    usersLoad = read_json(relevantUsers_path)
    
    commentsToPost = []
    
    for comments in commentsLoad:
        for user in usersLoad:
            if comments['user']['username'] == user:
                commentsToPost.append(comments) 
    write_json(commentsToPost_path, commentsToPost)

def tweetRelevantComments():
    commentsToPost_path= './instagram/comments/commentsToPost [' + MEDIA_ID + '].json'    
    commentsPosted_path= './instagram/comments/commentsPosted [' + MEDIA_ID + '].json'    
    
    commentsToPostLoad = read_json(commentsToPost_path)
    isFileEmpty = verifyIfFileIsEmpty(commentsPosted_path)
    
    if isFileEmpty == False: 
        commentsPostedLoad = read_json(commentsPosted_path)
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
            utils.sendTextTweet(tweet)
            if isFileEmpty == False:
                overwrite_json(commentsPosted_path, comment)
            else:
                commentsPosted = []
                commentsPosted.append(comment)
                write_json(commentsPosted_path, commentsPosted)
                isFileEmpty = verifyIfFileIsEmpty(commentsPosted_path)
               
        else:
            print('No new relevant comments to post')          

def verifyIfCommentWasAlreadyPosted(commentToPost):
    commentsPosted_path= './instagram/comments/commentsPosted [' + MEDIA_ID + '].json'
    if os.stat(commentsPosted_path).st_size != 0:
        commentsPostedLoad = read_json(commentsPosted_path)
        for commentsPosted in commentsPostedLoad:
            if commentsPosted['text'] == commentToPost['text']:
                wasPosted = True 
                return wasPosted
            else:
                wasPosted = False
    else:
        wasPosted = False
    return wasPosted

def verifyIfFileIsEmpty(folder_path):
    if os.stat(folder_path).st_size == 0:
        isEmpty = True 
    else:
        isEmpty = False 
    return isEmpty

commentsMaster()
#comments = web_api.media_n_comments(2331692048117583287, n=20)



