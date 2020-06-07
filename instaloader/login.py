import instaloader 
import os, sys

os.environ['IG_USER'] = 'corongabot'
os.environ['IG_PASSWORD'] = 'vivemosnumasociedade'
os.environ['BOTPY_USER'] = 'albxreche'

USER = os.getenv('IG_USER')
PASSWORD = os.getenv('IG_PASSWORD')
arg = sys.argv[1:]
BOTPY_USER = arg[0]
ig = instaloader.Instaloader() 
try:
    ig.login(USER, PASSWORD)
    profile = ig.check_profile_id(BOTPY_USER)
    print(profile.userid)
except:
    print('PY: Error logging in instagram')
    raise