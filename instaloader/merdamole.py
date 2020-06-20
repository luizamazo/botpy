import instaloader 
import os, sys

os.environ['IG_USER'] = 'corongabot'
os.environ['IG_PASSWORD'] = 'vivemosnumasociedade'
os.environ['BOTPY_USER'] = 'albxreche'

USER = os.getenv('IG_USER')
PASSWORD = os.getenv('IG_PASSWORD')
arg = sys.argv[1:]
BOTPY_USER = arg[0]
ig = instaloader.Instaloader(download_pictures=False, download_videos=False, download_video_thumbnails=False) 

posts = instaloader.Profile.from_username(ig.context, 'albxreche').get_posts()

users = set() 

for post in posts:
    if not post.owner_profile in users:
        ig.download_post(post, 'albxreche')
        users.add(post.owner_profile)
    else: 
        print("from skipped whatever idk")