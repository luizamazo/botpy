import instaloader 
import os, sys
import json
from datetime import datetime 

#arg = sys.argv[1:]
#BOT_USER = arg[0]

ig = instaloader.Instaloader(post_metadata_txt_pattern="", download_comments=False,
                             download_pictures=False, download_video_thumbnails=False,
                             download_videos=False,
                             ) 

ig.load_session_from_file('corongabot', filename = 'CORONGABOT')
profile = ig.check_profile_id('albxreche')
posts = instaloader.Profile.from_username(ig.context, 'albxreche').get_posts()
users = set() 

for post in posts:
    if not post.owner_profile in users:
        teste = ig.download_post(post, 'albxreche')
        print(post)
        users.add(post.owner_profile)
    else:
        print("{} from {} skipped.".format(post, post.owner_profile))