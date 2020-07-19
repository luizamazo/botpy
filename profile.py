import instaloader 
import os, sys
import json
import utils, utilsTwitter
import requests 
import shutil
from pprint import pprint
from datetime import datetime 

arg = sys.argv[1:]
#BOT_USER = arg[0]
BOT_USER = 'noctedaemones'
BOT_NAME = 'botzinho'

ig = instaloader.Instaloader(post_metadata_txt_pattern="", download_comments=False,
                             download_pictures=False, download_video_thumbnails=False,
                             download_videos=False,
                             ) 

ig.load_session_from_file('corongabot', filename = 'CORONGABOT')
profile = ig.check_profile_id(BOT_USER)
from_user = instaloader.Profile.from_username(ig.context, BOT_USER)

def master():
    userDetails_path= './instagram/userDetails.json'    
    handleUserDetails(userDetails_path, from_user)
    
def handleUserDetails(userDetails_path, from_user):
    userDetailsFile = utils.read_json(userDetails_path)
    userDetails = []
    userDetails.append({
        "profile_pic": from_user.profile_pic_url,
        "full_name": from_user.full_name,    
        "biography": from_user.biography,
        "external_url": from_user.external_url,
        "followers": from_user.followers,
        "following": from_user.followees,
    })
    payload = verifyChanges(userDetails_path, userDetailsFile, userDetails)
    print(payload[0]['userDetails'])
    userDetails = payload[0]['userDetails']
    tweetDetailChanges(payload)
    #utils.write_json(userDetails_path, userDetails)

def verifyChanges(userDetails_path, userDetailsFile, userDetails):
    userDetails = userDetails[0]
    if userDetailsFile['profile_pic'] != userDetails['profile_pic']:
        profilePicChanged = True
        file_path = './media/user/profile_pic.jpeg'
        utils.download_image(file_path, userDetails['profile_pic'])
    else:
        profilePicChanged = False
    if userDetailsFile['full_name'] != userDetails['full_name']:
        fullNameChanged = True
    else:
        fullNameChanged = False
    if userDetailsFile['biography'] != userDetails['biography']:
        bioChanged = True
    else:
        bioChanged = False
    if userDetailsFile['external_url'] != userDetails['external_url']:
        externalUrlChanged = True 
    else:
        externalUrlChanged = False
    if userDetailsFile['following'] != userDetails['following']:
        followingNumberChanged = True
        handleFollowingList()
    else: 
        followingNumberChanged = False
    newFollowersMark = verifyFollowersMark(userDetails)
    if userDetailsFile['followers'] != userDetails['followers']:
        if userDetailsFile['followersMark'] != newFollowersMark:
            followersMarkChanged = True
        else: 
            followersMarkChanged = False
    else: 
        followersMarkChanged = False
    userDetails['followersMark'] = newFollowersMark
    #utils.write_json(userDetails_path, userDetails)
    payload = []
    payload.append({
        "userDetails": userDetails,
        "full_name":{
            "fullNameChanged": fullNameChanged, 
            "newFullName": userDetails['full_name']
        },
        "bio":{
            "bioChanged": bioChanged, 
            "newBio": userDetails['biography']
        },
        "external_url": {
            "externalUrlChanged": externalUrlChanged,
            "newExternalUrl": userDetails['external_url']
        },
        "following": {
            "followingNumberChanged": followingNumberChanged, 
            "newFollowingNumber": userDetails['following']
        },
        "followersMark": {
            "followersMarkChanged": followersMarkChanged, 
            "newFollowersMark": userDetails['followersMark']
        },
        "profile_pic": {
            "profilePicChanged": profilePicChanged, 
            "profilePicUrl": userDetails['profile_pic']
        }
    })
    return payload 

def handleFollowingList(): 
    print('handle following ist')  
    followingList_path= './instagram/following/following.json' 
    followingList = []
    followees = from_user.get_followees()
    for follow in followees:
        follow = str(follow)
        follow = follow.replace('<Profile ', '')
        head, sep, tail = follow.partition('(')
        followingList.append({
            "username": head.strip(),
            "label": "following"
        })
    print('teste', followingList, len(followingList))
    isFileEmpty = utils.verifyIfFileIsEmpty(followingList_path)
    if len(followingList) > 0:
        if isFileEmpty == True:
            utils.write_json(followingList_path, followingList)
        else:
            followingListFile =  utils.read_json(followingList_path)
            for userFromArray in followingList: 
                userExistsFollowList = verifyNewFollows(userFromArray, followingList_path, followingListFile)
                print('userExists new follow', userExistsFollowList, userFromArray)
                if userExistsFollowList == False:
                    tweet = '[UPDATE] ' + BOT_USER + ' started following ' + userFromArray['username'] + '\n\n@BLACKPINK #' + BOT_NAME
                    utilsTwitter.sendTextTweet(tweet)
            for userFromFile in followingListFile:
                userExistsUnfollowList = verifyNewUnfollows(userFromFile, followingList_path, followingList)
                print('unfollow:userExists', userExistsUnfollowList, userFromFile)
                if userExistsUnfollowList == False:
                    tweet = '[UPDATE] ' + BOT_USER + ' unfollowed ' + userFromFile['username'] + '\n\n@BLACKPINK #' + BOT_NAME
                    utilsTwitter.sendTextTweet(tweet)
            utils.write_json(followingList_path, followingList)
            
def verifyNewUnfollows(userFromFile, followingList_path, followingList):
    if os.stat(followingList_path).st_size != 0:
        for userFromArray in followingList:
            if userFromFile['username'] == userFromArray['username']:
                userExists = True 
                return userExists
            else:
                userExists = False
    else:
        userExists = False
    return userExists
             
def verifyNewFollows(userFromArray, followingList_path, followingListFile):
    if os.stat(followingList_path).st_size != 0:
        for userFromFile in followingListFile:
            if userFromFile['username'] == userFromArray['username']:
                userExists = True 
                return userExists
            else:
                userExists = False
    else:
        userExists = False
    return userExists
  
def verifyFollowersMark(userDetails):
    followersMark = ''
    if userDetails['followers'] >= 1000000 and userDetails['followers'] < 5000000:
        followersMark = '1M'
    if userDetails['followers'] >= 5000000 and userDetails['followers'] < 10000000:
        followersMark = '5M'
    if userDetails['followers'] >= 25000000 and userDetails['followers'] < 30000000:
        followersMark = '25M'
    if userDetails['followers'] >= 30000000 and userDetails['followers'] < 35000000:
        followersMark = '30M'
    if userDetails['followers'] >= 35000000 and userDetails['followers'] < 40000000:
        followersMark = '35M'
    if userDetails['followers'] >= 40000000 and userDetails['followers'] < 45000000:
        followersMark = '40M'
    if userDetails['followers'] >= 45000000 and userDetails['followers'] < 50000000:
        followersMark = '45M'
    if userDetails['followers'] >= 50000000 and userDetails['followers'] < 55000000:
        followersMark = '50M'
    if userDetails['followers'] >= 55000000 and userDetails['followers'] < 60000000:
        followersMark = '55M'
    if userDetails['followers'] >= 60000000 and userDetails['followers'] < 65000000:
        followersMark = '60M'
    if userDetails['followers'] >= 65000000 and userDetails['followers'] < 70000000:
        followersMark = '65M'
    if userDetails['followers'] >= 70000000 and userDetails['followers'] < 75000000:
        followersMark = '70M'
    if userDetails['followers'] >= 75000000 and userDetails['followers'] < 80000000:
        followersMark = '75M'
    if userDetails['followers'] >= 80000000 and userDetails['followers'] < 85000000:
        followersMark = '80M'
    if userDetails['followers'] >= 85000000 and userDetails['followers'] < 90000000:
        followersMark = '85M'
    if userDetails['followers'] >= 90000000 and userDetails['followers'] < 95000000:
        followersMark = '90M'
    if userDetails['followers'] >= 95000000 and userDetails['followers'] < 100000000:
        followersMark = '95M'
    if userDetails['followers'] >= 100000000 and userDetails['followers'] < 110000000:
        followersMark = '100M'

    return followersMark
  
def tweetDetailChanges(payload):
    payload = payload[0]
    profile_pic = payload['profile_pic']
    fullName = payload['full_name']
    bio = payload['bio']
    external_url = payload['external_url']
    following = payload['following']
    followersMark = payload['followersMark']
    
    if profile_pic['profilePicChanged'] == True: 
        tweet = '[UPDATE] ' + BOT_USER + ' has a new profile pic:\n\n @BLACKPINK #' + BOT_NAME
        #print('PY: Tweet new profile pic')
        folder = "user"
        media_ids = utilsTwitter.uploadMedia(folder, "profile_pic")
        #utilsTwitter.sendTweet(folder, media_ids, tweet)
    if fullName['fullNameChanged'] == True: 
        tweet = '[UPDATE] '+ BOT_USER + ' has a new full name:\n\n' + fullName['newFullName'] + '\n\n@BLACKPINK #' + BOT_NAME
        #utilsTwitter.sendTextTweet(tweet)
    if bio['bioChanged'] == True:
        if bio['newBio']:
            key = ' has a new bio:'
        else:
            key = ' removed the bio'
        tweet = '[UPDATE] ' + BOT_USER + key + '\n\n' + bio['newBio'] + '\n\n@BLACKPINK #' + BOT_NAME
        #utilsTwitter.sendTextTweet(tweet)
    if external_url['externalUrlChanged'] == True:
        if external_url['newExternalUrl'] is not None:
            tweet = '[UPDATE] ' + BOT_USER + ' has a new external url:' + external_url['newExternalUrl'] + '\n\n@BLACKPINK #' + BOT_NAME
            #utilsTwitter.sendTextTweet(tweet)
    if followersMark['followersMarkChanged'] == True: 
        tweet = '[UPDATE] ' + BOT_USER + ' hits' + followersMark['newFollowersMark'] + '+ followers\n\n@BLACKPINK #' + BOT_NAME
        #utilsTwitter.sendTextTweet(tweet)

master()