const instagramPosts = require('instagram-posts');
const save = require('instagram-save');
const axios = require('axios'); 
let utils = require('../utils');
let fs = require('fs');
request = require('request');

let getInstagramPosts = async () => {
    
    let response = await instagramPosts('corongabot', {count: 3}),
    responseTypename = response[0].__typename,
    responseUrl = response[0].url,
    shortcode = response[0].shortcode,
    username = response[0].username,
    isPostDuplicate = false,
    instagramPost = {},
    mediaFromFolder = await utils.getMediaFromFolder('posts'),
    count = ''
  
    if(responseTypename != 'GraphSidecar'){
      shortcode = shortcode.split()
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode)
      console.log('is duplicate non graphsidecar', isPostDuplicate)
    }else{
      await convertGraphSideCar(responseUrl).then(res => {
        shortcode = res
      })
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode)
      console.log('is duplicate graphsidecar', isPostDuplicate)
    }
    //aqui faço verificaçao
    if(isPostDuplicate == false){ 
      if(mediaFromFolder.length >= 1) utils.deleteMediaFromFolder(mediaFromFolder, 'posts')
      let media = await saveMedia(response),
      text = response[0].text,
      time = response[0].time,
      typename = response[0].__typename
      text = text.replace('@', '@.')
      mediaFromFolder = await utils.getMediaFromFolder('posts'),
      count = countMediaType(mediaFromFolder)
    //console.log('response aki', response[0])
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

let saveMedia = async (response) => {
  let responseTypename = response[0].__typename
  let responseUrl = response[0].url
  let shortcodeOrder = []
  let singleMedia = ''

  if(responseTypename == 'GraphSidecar'){
   await convertGraphSideCar(responseUrl).then(shortcode => {
    shortcodeOrder = shortcode
   })
  }else{
    console.log('single media')
    singleMedia= await save(responseUrl, '././media/posts/').then(res => {
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
            console.log('chamou a utils download')
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
  console.log('media', media)
  if(media.length == 0){
    return false
  }else{
    while(shortcode.length != 0){
      for(file of media){
        if(shortcode.length != 0){
          let firstElement = shortcode[0]
          console.log('shortcode', shortcode)
          if(file.includes(firstElement)){
            console.log(`arquivo duplicado, file ${file} | firstElement ${firstElement}`)
            flag = true 
            shortcode.shift()
          }else{
            flag = false 
            shortcode.shift()
            console.log('nao tinha ainda o arquivo')
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
    count = `| ${countPictures}P${countVideos}V`
  }

  if(countPictures == 0 && countVideos > 1){
    count = `| ${countVideos}V`
  }else if(countVideos == 0 && countPictures > 1){
    count = `| ${countPictures}P`
  }

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