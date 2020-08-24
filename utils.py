import os 
import requests, shutil
from settings import config
import pathlib
import codecs
import json, re

def teste(tweet): 
    print('finge q enviou o tweet', tweet)

def download_image(file_path, image_url):
    r = requests.get(image_url, stream = True)
    if r.status_code == 200:
        r.raw.decode_content = True
        with open(file_path,'wb') as f:
            shutil.copyfileobj(r.raw, f)
        print('Image sucessfully Downloaded: ',file_path)
    else:
        print('Image Couldn\'t be retreived')
   
def getMediaFromFolder(folder):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    media_list = [] 
    print('getMediaFromFolder', mediaFolder)
 
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            if folder == "posts":                    
                fileName = os.path.join(dirpath, f)
                print('fileName', fileName)
                media_list.append(fileName)
                print('media_list no if', media_list)
            elif folder == "stories":
                fileName = os.path.join(dirpath, f).replace('media/stories\\', '')
                media_list.append(fileName)
            elif folder == "user":
                fileName = os.path.join(dirpath, f).replace('media/user\\', '')
                media_list.append(fileName)
    print('PY: mediaFromFolder ->', media_list)
    return media_list
    
def getFileFromMediaFolder(folder, fileName):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            print('PY: getFileFromMediaFolder ->', f)
            if fileName in f:
                mediaPath = os.path.join(dirpath, f)
    return mediaPath            

def deleteMediaFromFolder(folder, subfolder):
    dir = os.path.dirname(__file__)
    path = os.path.join(dir, folder + subfolder)
    print(path) 
    shutil.rmtree(path) 
    os.mkdir(path)
    
def deleteFileFromFolder(folder, fileName):
    dir = os.path.dirname(__file__)
    mediaFolder = os.path.join(dir, 'media/' + folder)
    for dirpath, dirnames, files in os.walk(mediaFolder):
        for f in files:
            if fileName in f:
                print('Deleting file ->', os.path.join(dirpath, f))
                os.remove(os.path.join(dirpath, f)) 

def getCachedSettings(file_path):
    with open(file_path) as file_data:
        cached_settings = json.load(file_data, object_hook=from_json)
    file_data.close()
    return cached_settings
    
def from_json(json_object):
    if '__class__' in json_object and json_object['__class__'] == 'bytes':
        return codecs.decode(json_object['__value__'].encode(), 'base64')
    return json_object
        
def write_json(file_path, content):
    with open(file_path, 'w') as outfile:
        print('writing file to', file_path)
        json.dump(content, outfile)
    outfile.close()
    print("writing done")

def read_json(file_path):
    with open(file_path) as json_file:
        result = json.load(json_file)
    json_file.close()
    print("reading done")
    return result

def overwrite_json(file_path, content):
    with open(file_path, 'r+') as json_file:
        result = json.load(json_file)
        result.append(content)
        json_file.seek(0)
        json.dump(result, json_file)
    json_file.close()
    print("overwriting done")
    return result

def verifyIfFileIsEmpty(file_path):
    if os.stat(file_path).st_size == 0:
        isEmpty = True 
    else:
        isEmpty = False 
    return isEmpty
