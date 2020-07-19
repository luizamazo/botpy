import instaloader 
import os, sys
import json
from pprint import pprint
from datetime import datetime 

arg = sys.argv[1:]
BOT_USER = 'hi_sseulgi'

ig = instaloader.Instaloader(post_metadata_txt_pattern="", download_comments=False,
                             download_pictures=False, download_video_thumbnails=False,
                             download_videos=False,
                             ) 

ig.load_session_from_file('corongabot', filename = 'CORONGABOT')
profile = ig.check_profile_id(BOT_USER)
from_user = instaloader.Profile.from_username(ig.context, BOT_USER)
posts = from_user.get_posts()
users = set() 

for post in posts:
    if not post.owner_profile in users:
        teste = ig.download_post(post, BOT_USER)
        users.add(post.owner_profile)
        pprint(vars(post))
        typename = post._node['__typename']
        postObject = post
        post = str(post)
        shortcode = post.replace('<Post', '').replace('>', '')
        shortcode = shortcode.strip()

media_id = instaloader.Post.shortcode_to_mediaid(shortcode)
teste = []
teste.append({
    "post_shortcode": shortcode,
    "typename": typename,
    "media_id": media_id,
    "profile_pic": from_user.profile_pic_url,
    "full_name": from_user.full_name,    
    "biography": from_user.biography,
    "external_url": from_user.external_url,
    "followers": from_user.followers,
    "following": from_user.followees,
    
})
print(teste)
#sys.stdout.write(str(teste))