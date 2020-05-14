const instagramPosts = require('instagram-posts');
const save = require('instagram-save');
const axios = require('axios'); 
let utils = require('../utils');
let fs = require('fs');
let path = require('path');
request = require('request');

let IG_USER = 'britneyspears'

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
      shortcode = shortcode.split()
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode)
      console.log('Is Non GraphSideCar duplicate?', isPostDuplicate)
    }else{
      await convertGraphSideCar(responseUrl).then(res => {
        shortcode = res
      })
      await verifyIfPostIsDuplicate(mediaFromFolder, shortcode).then(res =>{
        isPostDuplicate = res
        console.log('Is GraphSideCar duplicate?', isPostDuplicate)
      })
    }
  
    if(isPostDuplicate == false){ 
      if(mediaFromFolder.length >= 1) utils.deleteMediaFromFolder(mediaFromFolder, 'posts')
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
  }else{
    console.log('IG Post has a single media and it was saved')
    filePath = path.resolve('media', 'posts')
    singleMedia= await save(responseUrl, filePath).then(res => {
      console.log('res', res)
      let fileName = res.url 
      fileName = fileName.replace('https://www.instagram.com/p/', '')
      fileName = fileName.split()
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

let verifyIfPostIsDuplicate = async (media, shortcode) => {
  let flag = false
  console.log(`Verifying if post is duplicate...
  Current media from the folder ->`, media)
  if(media.length == 0){
    return false
  }else{
    while(shortcode.length != 0){
      for(file of media){
        if(shortcode.length != 0){
          let firstElement = shortcode[0]
          if(file.includes(firstElement)){
            console.log(`Duplicate media, file ${file}`)
            flag = true 
            shortcode.shift()
          }else{
            flag = false 
            shortcode.shift()
            console.log(`File ${file} didnt exist before`)
          }
        }
      }
    }
  }
  return flag
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