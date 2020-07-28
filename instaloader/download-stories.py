import instaloader 
import os, sys
import json
from datetime import datetime 

arg = sys.argv[1:]
BOT_USER = arg[0]

ig = instaloader.Instaloader() 
ig.load_session_from_file('baerserk', filename = 'SERKBOT')
profile = ig.check_profile_id(BOT_USER)

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


