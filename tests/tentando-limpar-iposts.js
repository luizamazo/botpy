const instagramPosts = require('instagram-posts');
const save = require('instagram-save');
const axios = require('axios'); 
let utils = require('../utils');
let fs = require('fs');
request = require('request');

let IG_USER = 'corongabot'

let getInstagramPosts = async () => {
    
    let response = await callInstaPosts(),
        responseIndex = response[0]
        responseTypename = responseIndex.__typename,
        responseUrl = responseIndex.url,
        shortcode = responseIndex.shortcode,
        username = responseIndex.username,
        isPostDuplicate = false,
        instagramPost = {},
        mediaFromFolder = await utils.getMediaFromFolder('posts'),
        count = ''
  
    if(responseTypename != 'GraphSidecar'){
      shortcode = shortcode.split()
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode)
      console.log('Is Non GraphSideCar duplicate?', isPostDuplicate)
    }else{
      await convertGraphSideCar(responseUrl).then(res => {
        shortcode = res
      })
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode)
      console.log('Is GraphSideCar duplicate?', isPostDuplicate)
    }
    
    if(isPostDuplicate == false){ 
      if(mediaFromFolder.length >= 1) utils.deleteMediaFromFolder(mediaFromFolder, 'posts')
      await saveMedia(response),
      text = responseIndex.text,
      time = responseIndex.time,
      typename = responseIndex.__typename
      text = text.replace(/@/g, '@.')
      mediaFromFolder = await utils.getMediaFromFolder('posts'),
      count = countMediaType(mediaFromFolder)

      instagramPost = [{
        'duplicate': false,
        'typename': typename,
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

let saveMedia = async response => {
  let responseIndex = response[0],
      responseTypename = responseIndex.__typename,
      responseUrl = responseIndex.url

  if(responseTypename == 'GraphSidecar'){
   await convertGraphSideCar(responseUrl).then(shortcode => {
    shortcodeOrder = shortcode
   })
  }else{
    singleMedia= await save(responseUrl, '././media/posts/').then(res => {
      console.log('IG Post has a single media and it was saved')
    })
  }
}

let convertGraphSideCar = async responseUrl => {
    responseUrl = responseUrl + '?__a=1'
    let urlShortcode = []

    return await axios({url: responseUrl, method: 'GET' })
      .then(response => {
        let body = response.data
        let media = body.graphql.shortcode_media
        media = Object.entries(media.edge_sidecar_to_children)

        for(const[key, value] of media) {
          let node = value.map((novo) => {
            return novo.node
          })
          urlShortcode = getUrlShortCode(node)
        }
        
        let number = 0
        path = '././media/posts/'
        for(value of urlShortcode){  
          number++
          utils.download(value.url, `${number} - ${value.shortcode}`, path).then(res => {
            console.log('Its a GraphSideCar and it was downloaded (but not saved to a file)')
          })
        } 
      }).catch(error => {
        console.error(error)
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
            console.log('File didnt exist before')
          }
        }
      }
    }
  }
  return flag
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
    count = `|${countPictures}P${countVideos}V`
  }

  if(countPictures == 0 && countVideos > 1){
    count = `|${countVideos}V`
  }else if(countVideos == 0 && countPictures > 1){
    count = `|${countPictures}P`
  }
  console.log('Media Count: Post has', count)
  return count
}

/*(async () => {
  let teste = await getInstagramPosts()
  console.log(teste)
})
(); */

module.exports = {
  getInstagramPosts
}