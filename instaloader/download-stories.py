import instaloader 
import os, sys
import json
from datetime import datetime 

os.environ['IG_USER'] = 'corongabot'
os.environ['IG_PASSWORD'] = 'vivemosnumasociedade'
os.environ['BOTPY_USER'] = 'albxreche'

USER = os.getenv('IG_USER')
PASSWORD = os.getenv('IG_PASSWORD')

ig = instaloader.Instaloader() 
ig.load_session_from_file('corongabot', filename = 'CORONGABOT')
profile = ig.check_profile_id('albxreche')
""" 
try:
    ig.login(USER, PASSWORD)
except:
    print('PY: Error logging in instagram')
    raise """

teste = []
for story in ig.get_stories(userids=[profile.userid]):
    for item in story.get_items():
        timestamp = datetime.timestamp(item.expiring_utc)
        if item.is_video == True:
            teste.append({
                'url': item.video_url, 
                'exp': timestamp,
                'typename': item.typename,
                'shortcode': item.shortcode
            })
        else:
            teste.append({
                'url': item.url, 
                'exp': timestamp,
                'typename': item.typename,
                'shortcode': item.shortcode
            })
            
    #ig.download_stories(userids=[profile.userid], fast_update=False, filename_target='media') 
if len(teste) == 0:  
    print(0)
else:   
    teste_json = json.dumps(teste)
    print(teste_json)
#ig.download_stories(userids=[profile.userid]) 



""" posts = instaloader.Profile.from_username(igloader.context, 'albxreche').get_posts()

users = set() 

for post in posts:
    if not post.owner_profile in users:
        igloader.download_post(post, 'albxreche')
        users.add(post.owner_profile)
    else: 
        print("from skipped whatever idk") """