require('dotenv').config({path: '../../.env'})

const axios = require('axios')
const utils = require('../utils')
let path = require('path')
const fs = require('fs')

let getInstagramPosts = async (payload) => {
    let payloadIndex = payload[0],
        shortcode = payloadIndex.post_shortcode,
        typename = payloadIndex.typename,
        mediaFromFolder = '',
        instagramPost = [],
        postUrl = `https://www.instagram.com/p/${shortcode}`
    let postPayload = await inspectPost(shortcode, typename)
    console.log('after inspect post, payload is', postPayload)
    mediaFromFolder = await utils.getMediaFromFolder('posts')
    if(typename == 'GraphSidecar'){
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, postPayload.shortcode)
      console.log('is graphsidecar duplicate?', isPostDuplicate)
      postPayload = postPayload.sidecarPayload
    }else{
      console.log('antes do verify', postPayload)
      isPostDuplicate = await verifyIfPostIsDuplicate(mediaFromFolder, shortcode.split())
      console.log('Is non graphsidecar duplicate?', isPostDuplicate, 'dps do verifty', postPayload)
    }
    if(typename == 'GraphSidecar'){
      postPayload = postPayload[0]
    }
    if(isPostDuplicate == false){
      if(mediaFromFolder.length >= 1){await utils.deleteMediaFromFolder(mediaFromFolder, 'posts')}
      await saveMedia(postPayload, typename)
      await handleComments(postPayload.media_id)
      let postMediaCount = ''
      postPayload.caption = postPayload.caption.replace(/@/g, '@.')
      mediaFromFolder = await utils.getMediaFromFolder('posts')
      postMediaCount = countMediaType(mediaFromFolder)
      instagramPost = [{
        'duplicate': false, 
        'typename': typename,
        'postPayload': postPayload,
        'postUrl': postUrl,
        'postMediaCount': postMediaCount
      }]
    }else{
      instagramPost = [{
        'duplicate': true, 
        'typename': typename,
        'postPayload': postPayload,
        'postUrl': postUrl
      }]
    }
    return instagramPost
}

let inspectPost = async (shortcode, typename) => {
  postUrl = `https://www.instagram.com/p/${shortcode}/?__a=1`
  return await axios({url: postUrl, method: 'GET' })
    .then(async response => {
      let {graphql} = response.data,
          shortcodeMedia = graphql.shortcode_media, 
          edgeMediaToCaption = shortcodeMedia.edge_media_to_caption.edges[0],
          caption = '',
          takenAt = shortcodeMedia.taken_at_timestamp,
          media_id = shortcodeMedia.id 
      if(edgeMediaToCaption != undefined){
        caption = edgeMediaToCaption.node.text
      }
      if(typename == 'GraphImage'){
        payload =  {
          "url": shortcodeMedia.display_url,
          "shortcode": [shortcode],
          "caption": caption,
          "takenAt": takenAt,
          "media_id": media_id
        }
      }else if(typename == 'GraphVideo'){
        if(shortcodeMedia.product_type == 'igtv'){
          payload = {
            "isIGTV": true, 
            "IGTVUrl": shortcodeMedia.video_url, 
            "thumbnailUrl": shortcodeMedia.thumbnail_src,
            "shortcode": [shortcode],
            "title": shortcodeMedia.title,
            "caption": caption,
            "takenAt": takenAt,
            "media_id": media_id
          }
        }else{
          payload = {
            "isIGTV": false,
            "url": shortcodeMedia.video_url,
            "shortcode": [shortcode],
            "caption": caption,
            "takenAt": takenAt,
            "media_id": media_id
          }
        }
      }else if(typename == 'GraphSidecar'){
          captionTimeMediaId = {
            "caption": caption, 
            "takenAt": takenAt,
            "media_id": media_id
          }
          payload = await inspectGraphSideCar(
            shortcodeMedia.edge_sidecar_to_children.edges, 
            captionTimeMediaId
          )
      }
      return payload
    }).catch(error => {
      console.error(error)
    }) 
}

let inspectGraphSideCar = async (edges, captionTimeMediaId) => {
  let shortcodes = [],
      sidecarPayload = []
  for(value of edges){
    if(value.node.is_video){
      sidecarPayload.push({
        "url": value.node.video_url, 
        "shortcode": value.node.shortcode,
        "is_video": value,
        "caption": captionTimeMediaId.caption,
        "takenAt": captionTimeMediaId.takenAt,
        "media_id": captionTimeMediaId.media_id
      })
    }else{
      sidecarPayload.push({
        "url": value.node.display_url, 
        "shortcode": value.node.shortcode,
        "is_video": value.node.is_video,
        "caption": captionTimeMediaId.caption,
        "takenAt": captionTimeMediaId.takenAt,
        "media_id": captionTimeMediaId.media_id
      })
    }
    shortcodes.push(value.node.shortcode)
  }
  return {"sidecarPayload": sidecarPayload, "shortcode": shortcodes} 
}

let verifyIfPostIsDuplicate = async (mediaFromFolder, shortcode) => {
  let flag = false 
  console.log(`Verifying if post is duplicate...
  Current media from the folder ->`, mediaFromFolder, 'length mff', mediaFromFolder.length, ' shortcode[0]', shortcode[0], shortcode)
  if(mediaFromFolder.length == 0){
    console.log('Posts folder was empty')
  }else{
    while(shortcode.length != 0){
      for(file of mediaFromFolder){
        if(shortcode.length != 0){
          let firstElement = shortcode[0]
          if(file.includes(firstElement)){
            console.log(`Duplicate media, file ${file}`)
            flag = true 
            shortcode.shift()
          }else{
            console.log(`${firstElement} didnt exist before`)
            flag = false 
            shortcode.shift()
          }
        }
      }
    }
  }
  return flag
}

let saveMedia = async (postPayload, typename) => {
  let number = 0 
  console.log('postpayload no savemedia', postPayload)
  if(typename == 'GraphSidecar'){
    for(value of postPayload){
      number++
      filePath = path.resolve('media', 'posts', `${number} - ${value.shortcode}`)
      await utils.download(value.url, filePath).then(res => {
        console.log(`${filePath} was downloaded and saved to a file`)
      }) 
    }
  }else if(typename == 'GraphVideo' && postPayload.isIGTV){
      filePath = path.resolve('media', 'posts', `thumbnail`)
      console.log('EH IGTV', postPayload, 'filepath', filePath)
      await utils.download(postPayload.thumbnailUrl, filePath).then(res => {
        console.log(`IGTV THUMB ${filePath} was downloaded and saved to a file`)
      })
      filePath = path.resolve('media', 'posts', `${postPayload.shortcode}`)
      await utils.download(postPayload.IGTVUrl, filePath).then(res => {
        console.log(`IGTV FILE ${filePath} was downloaded and saved to a file`)
      })
  }else{
    filePath = path.resolve('media', 'posts', `${postPayload.shortcode}`)
    await utils.download(postPayload.url, filePath).then(res => {
      console.log(`${filePath} was downloaded and saved to a file`)
    }) 
  }
}

let handleComments = async media_id => {
  folderPath = path.resolve('instagram', 'comments')
  filesFromFolder = await utils.getFilesFromFolder(folderPath)
  await utils.deleteComments(filesFromFolder, 'comments')
  commentsPosted = path.resolve('instagram', 'comments', `commentsPosted [${media_id}].json`)
  fs.closeSync(fs.openSync(commentsPosted, 'w'))
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