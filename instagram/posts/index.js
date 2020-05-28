const instagramPosts = require('instagram-posts');
const save = require('instagram-save');
const axios = require('axios'); 
let utils = require('../utils');
let fs = require('fs');
let path = require('path');
request = require('request');
require('dotenv').config({path: '../../.env'})
//console.log(path.resolve(__dirname, '../../.env'))

const IG_USER = 'bianca'
const PRODUCTION  = 'https://examplePage.com';
const DEVELOPMENT = 'http://localhost:5000';
const URI = (process.env.NODE_ENV ? PRODUCTION : DEVELOPMENT);


let getInstagramPosts = async () => {

    let response = await callInstaPosts()
    let responseIndex = response[0],
        responseTypename = responseIndex.__typename,
        responseUrl = responseIndex.url,
        shortcode = responseIndex.shortcode,
        username = responseIndex.username,
        isPostDuplicate = false,
        instagramPost = {},
        mediaFromFolder = '',
        count = ''

    mediaFromFolder = await utils.getMediaFromFolder('posts')

    if(responseTypename != 'GraphSidecar'){
      singleShortcode = shortcode.split()
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, singleShortcode)
      console.log('Is Non GraphSideCar duplicate?', isPostDuplicate)
    }else{
      shortcode = await convertGraphSideCar(responseUrl)
      await verifyIfPostIsDuplicate(mediaFromFolder, shortcode).then(res =>{
        isPostDuplicate = res
        console.log('Is GraphSideCar duplicate?', isPostDuplicate)
      })
    }
    if(isPostDuplicate == false){ 
      if(mediaFromFolder.length >= 1){utils.deleteMediaFromFolder(mediaFromFolder, 'posts')}
      let media = await saveMedia(response)
      let text = responseIndex.text,
      time = responseIndex.time,
      typename = responseIndex.__typename,
      count = ''

      text = text.replace(/@/g, '@.')
      mediaFromFolder = await utils.getMediaFromFolder('posts')
      count = countMediaType(mediaFromFolder)

      instagramPost = [{
        'duplicate': false,
        'typename': typename,
        'media': media,
        'username': username,
        'text': text,
        'time': time,
        'url': responseUrl,
        'count': count
      }]

    }else{
      instagramPost = [{
        'duplicate': true,
        'username': username
      }]
    }
    return instagramPost 
}


let callInstaPosts = async () => {
  let count = 0,
  maxTries = 5
  while(true){
    try {
      console.log('Entered try -> callInstaPosts')
      instaPosts = await instagramPosts(IG_USER, {count: 1})
      return instaPosts
    }catch(error) {
      if(++count == maxTries){
        console.error(error)
        throw error
      }else{
        continue
      }
    } 
  } 
}

let saveMedia = async (response) => {
  let responseIndex = response[0],
      responseTypename = responseIndex.__typename,
      responseUrl = responseIndex.url,
      shortcodeOrder = [],
      singleMedia = ''

  if(responseTypename == 'GraphSidecar'){
   await convertGraphSideCar(responseUrl).then(shortcode => {
    shortcodeOrder = shortcode
   })
   await updatePostsOnDatabase(shortcodeOrder)
  }else{
    console.log('IG Post has a single media and it was saved')
    filePath = path.resolve('media', 'posts')
    singleMedia= await save(responseUrl, filePath).then(async res => {
      let fileName = res.url 
      fileName = fileName.replace('https://www.instagram.com/p/', '')
      fileName = fileName.split()
      await updatePostsOnDatabase(fileName)
      return fileName
    }) 
  }
  return shortcodeOrder.length == 0 ? singleMedia : shortcodeOrder
}

let convertGraphSideCar = async responseUrl => {
    responseUrl = responseUrl + '?__a=1'
    let urlShortcode = []

    return await axios({url: responseUrl, method: 'GET' })
      .then(async response => {
        let body = response.data
        let media = body.graphql.shortcode_media,
            number = 0,
            filePath = ''

        media = Object.entries(media.edge_sidecar_to_children)

        for(const[key, value] of media) {
          let node = value.map((novo) => {
            return novo.node
          })
          urlShortcode = getUrlShortCode(node)
        }
        
        for(value of urlShortcode){  
          number++
          filePath = path.resolve('media', 'posts', `${number} - ${value.shortcode}`)
          await utils.download(value.url, filePath).then(res => {
            console.log(`${filePath} was downloaded and saved to a file`)
          }) 
        } 
       
       shortcodeOrder = orderMedia(urlShortcode)
       return shortcodeOrder
      }).catch(error => {
        console.log(error)
      })
}

let getUrlShortCode = node => {
  let uri = []
  for(child of node){
   
    if(child.is_video){
      uri.push({
        'url': child.video_url,
        'shortcode': child.shortcode,
        'is_video': child.is_video
      })
    }else{
      uri.push({
        'url': child.display_url,
        'shortcode': child.shortcode,
        'is_video': child.is_video
      })
    }
  } 
  return uri
}

let verifyIfPostIsDuplicate = async (media, postShortcode) => {
  let flag = false
  console.log(`Verifying if post is duplicate...
  Current media from the folder ->`, media)
  if(media.length == 0){
    flag = await verifyIfPostIsDuplicateDataBase(postShortcode)
  }else{
    while(postShortcode.length != 0){
      for(file of media){
        if(postShortcode.length != 0){
          let firstElement = postShortcode[0]
          if(file.includes(firstElement)){
            console.log(`Duplicate media, file ${file}`)
            flag = true 
            postShortcode.shift()
          }else{
            flag = false 
            postShortcode.shift()
            console.log(`File ${file} didnt exist before`)
          }
        }
      }
    }
  }
  return flag
}

let verifyIfPostIsDuplicateDataBase = async (postShortcode) => {
  console.log("Folder was empty, calling database to verify if post is duplicate...")
  let bot = await callPostsFromDataBase()
  let flag = false

  while(postShortcode.length != 0){
    for(file of bot.posts){
      if(postShortcode.length != 0){
        let firstElement = postShortcode[0]
        if(file.includes(firstElement)){
          console.log(`Duplicate media, file ${file}`)
          flag = true 
          postShortcode.shift()
        }else{
          flag = false 
          postShortcode.shift()
          console.log(`File ${file} didnt exist before`)
        }
      }
    }
  }
  return flag
}

let callPostsFromDataBase = async () => {
  return await axios({url: `${URI}/show/${process.env.BOT_NAME}`, method: 'GET' })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
      }) 
}

let updatePostsOnDatabase = async (shortcode) => {

  if(typeof shortcode == 'string') shortcode = shortcode.split() 
  return await axios({url: `${URI}/updatePosts/${process.env.BOT_NAME}`, method: 'PUT', data: {posts: shortcode}})
        .then(response => {
         console.log(response.data)
        }).catch(error => {
          console.error(error)
        })  
}

let orderMedia = urlShortcode => {
  let shortcodeOrder = urlShortcode.map(value => {
    return value.shortcode
  })
  return shortcodeOrder
}

let countMediaType = mediaFromFolder => {
  let countPictures = 0,
  countVideos = 0,
  count = ''
  for(file of mediaFromFolder){
    if(file.includes('jpg') || file.includes('png') || file.includes('jpeg')){
      countPictures++
    }else{
      countVideos++
    } 
  }

  if(countPictures != 0 && countVideos != 0){
    count = ` | ${countPictures}P${countVideos}V`
  }

  if(countPictures == 0 && countVideos > 1){
    count = ` | ${countVideos}V`
  }else if(countVideos == 0 && countPictures > 1){
    count = ` | ${countPictures}P`
  }
  console.log('Media Count: Post has', count)
  return count
}

module.exports = {
  getInstagramPosts
}