from instaloader import instaloader, InstaloaderException
import os, sys
import json
from pprint import pprint
from datetime import datetime 

arg = sys.argv[1:]
#BOT_USER = arg[0]
BOT_USER = 'baerserk'
ig = instaloader.Instaloader(post_metadata_txt_pattern="", download_comments=False,
                             download_pictures=False, download_video_thumbnails=False,
                             download_videos=False,
                             save_metadata=False
                            ) 

try:  
    ig.load_session_from_file('baerserk', filename = 'SERKBOT')
    profile = ig.check_profile_id(BOT_USER)
    from_user = instaloader.Profile.from_username(ig.context, BOT_USER)
    posts = from_user.get_posts()
    users = set() 

    for post in posts:
        if not post.owner_profile in users:
            teste = ig.download_post(post, BOT_USER)
            users.add(post.owner_profile)
            #pprint(vars(post))
            typename = post._node['__typename']
            postObject = post
            post = str(post)
            shortcode = post.replace('<Post', '').replace('>', '')
            shortcode = shortcode.strip()
            break

    media_id = instaloader.Post.shortcode_to_mediaid(shortcode)
    teste = []
    teste.append({
        "post_shortcode": shortcode,
        "typename": typename,
        "media_id": media_id
    })
    print(teste)
except InstaloaderException as error:
    print('deu ruim', error)
#sys.stdout.write(str(teste))