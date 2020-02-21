import os 
import configparser
import tweepy 
#reads configuration file that holds all settings 

abspath = os.path.abspath(__file__)
dirname = os.path.dirname(abspath)

config = configparser.ConfigParser()
config.read(dirname + '/settings')
twitter_config = config['Twitter']
app_config = config['App']
consumer_key = twitter_config['consumer_key']
consumer_secret = twitter_config['consumer_secret']
access_token = twitter_config['access_token']
access_token_secret = twitter_config['access_token_secret']

media_folder = app_config['media_folder']