require('dotenv').config({path: '../../.env'})

const instagramPosts = require('instagram-posts')
const save = require('instagram-save')
const axios = require('axios')
const utils = require('../utils')
const jsonfile = require('jsonfile')
let path = require('path')
const fs = require('fs')
const LocalStorage = require('node-localstorage').LocalStorage
const localStorage = new LocalStorage('./storage')

const BOT_USER = process.env.BOT_USER

let getInstagramPosts = async () => {

    let response = await callInstaPosts()
    let responseIndex = response[0], 
        responseTypename = responseIndex.__typename,
        responseUrl = responseIndex.url,
        shortcode = responseIndex.shortcode,
        username = responseIndex.username,
        media_id = responseIndex.id,
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
      let result = await saveMedia(response)
      if(result.isIGTV){
        console.log('meee', mediaFromFolder, mediaFromFolder.length)
        filePath = path.resolve('media', 'posts', 'thumbnail')
        console.log('AKI', responseIndex.thumbnail_src, response)
        await utils.download(responseIndex.thumbnail_src, filePath).then(res => {
        console.log(`IGTV THUMB ${filePath} was downloaded and saved to a file`)
        })
      } 

      await handleComments(media_id)

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
        'username': username,
        'isIGTV': result.isIGTV,
        'igTVUrl': result.igTVUrl,
        'text': text,
        'time': time,
        'url': responseUrl,
        'count': count
      }]

    }else{
      countNewUserDetails = localStorage.getItem('countNewUserDetails')
      searchForNewUserDetails = localStorage.getItem('searchForNewUserDetails')
      console.log(`
          NO INICIO
          count ${countNewUserDetails}
          searchForNewUserDetails ${searchForNewUserDetails}
      `)
      
      if(searchForNewUserDetails == null){
          localStorage.setItem('searchForNewUserDetails', true)
          searchForNewUserDetails = localStorage.getItem('searchForNewUserDetails')
      }
      if(countNewUserDetails == null){
          localStorage.setItem('countNewUserDetails', 1)
          countNewUserDetails = localStorage.getItem('countNewUserDetails')
      }
      countNewUserDetails = parseInt(countNewUserDetails)

      console.log(`
          NO MEIO
          countNewUserDetails ${countNewUserDetails}
          searchForNewUserDetails ${searchForNewUserDetails}
      `)

      if(countNewUserDetails == 1){
          countNewUserDetails++
          localStorage.setItem('countNewUserDetails', countNewUserDetails)
          console.log('countNewUserDetails == 1, novo valor de countNewUserDetails', countNewUserDetails)
      }else if(countNewUserDetails == 2){
        searchForNewUserDetails =  localStorage.getItem('searchForNewUserDetails')
        if(searchForNewUserDetails == 'true'){ 
          let verifiedUserDetails = await verifyUserDetailChanges()

          instagramPost = [{
            'duplicate': true,
            'media_id': media_id,
            'url': responseUrl,
            'full_name': verifiedUserDetails.full_name, 
            'bio': verifiedUserDetails.bio,
            'external_url': verifiedUserDetails.external_url,
            'following': verifiedUserDetails.following,
            'profile_pic': verifiedUserDetails.profile_pic,
            'followersMark': verifiedUserDetails.followersMark
          }]

        }else{
            console.log('nao deve chamar a lib de search comments, pulou a vez')
            instagramPost = [{
              'duplicate': true,
              'media_id': media_id,
              'url': responseUrl,
              'full_name': {fullNameChanged: false}, 
              'bio': {bioChanged: false},
              'external_url': {externalUrlChanged: false},
              'following': {followingNumberChanged: false},
              'profile_pic': {profilePicChanged: false},
              'followersMark': {followersMarkChanged: false}
            }]
        }
        if(searchForNewUserDetails == 'true'){
            localStorage.setItem('searchForNewUserDetails', false)
        }else{
            localStorage.setItem('searchForNewUserDetails', true)
        }
        localStorage.setItem('countNewUserDetails', 1)
      }
    }
    return instagramPost  
}

let handleComments = async (media_id) => {
  console.log('no handle comment')
  folder_path = path.resolve('instagram', 'comments')
  filesFromFolder = await utils.getFilesFromFolder(folder_path)
  utils.deleteComments(filesFromFolder, 'comments')
  commentsPosted = path.resolve('instagram', 'comments',`commentsPosted [${media_id}].json`)
  //commentsToPost =  path.resolve('instagram', 'comments',`commentsToPost [${media_id}].json`)
  console.log('commentsPosted path', commentsPosted)
  fs.closeSync(fs.openSync(commentsPosted, 'w'))
  //fs.closeSync(fs.openSync(commentsToPost, 'w'))
}

let verifyUserDetailChanges = async () => {
  let userUrl = `https://www.instagram.com/${BOT_USER}/?__a=1`  
  
  return await axios({url: userUrl, method: 'GET' })
    .then(async response => {
      let {graphql} = response.data,
      user = graphql.user,
      fullNameChanged = false,
      bioChanged = false,
      externalUrlChanged = false,
      followingNumberChanged = false,
      profilePicChanged = false,
      followersMarkChanged = false,
      userDetails = {}
      
      userDetails = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        bio: user.biography,
        external_url: user.external_url,
        following: user.edge_follow.count,
        followers: user.edge_followed_by.count,
        profile_pic: user.profile_pic_url_hd
      }

      file = path.resolve('instagram', 'userDetails.json')

      let json = jsonfile.readFileSync(file)
      let isEqual = Object.entries(json).toString() === Object.entries(userDetails).toString()
      
      if(!isEqual){

        if(json.full_name != userDetails.full_name){
          fullNameChanged = true
        }

        if(json.bio != userDetails.bio){
          bioChanged = true
        }

        if(json.external_url != userDetails.external_url){
          externalUrlChanged = true
        }

        if(json.following != userDetails.following){
          followingNumberChanged = true
        }
        
        let newFollowersMark = await verifyFollowersMarks(userDetails)
        if(json.followers != userDetails.followers){
          if(json.followersMark !== newFollowersMark){
            console.log('entrou no if hmmm')
            followersMarkChanged = true
          }
        }
        userDetails.followersMark = newFollowersMark
        if(json.profile_pic != userDetails.profile_pic){
          filePath = path.resolve('media', 'user', `profile_pic`)
          await utils.download(userDetails.profile_pic, filePath).then(res => {
            console.log(`${filePath} was downloaded and saved to a file`)
          }) 
          profilePicChanged = true
        }
        jsonfile.writeFileSync(file, userDetails)
      }
      let payload = { 
          full_name: {
            fullNameChanged: fullNameChanged,
            newFullName: userDetails.full_name
          },
          bio:{
            bioChanged: bioChanged,
            newBio: userDetails.bio
          },
          external_url: {
            externalUrlChanged: externalUrlChanged,
            newExternalUrl: userDetails.external_url
          },
          following: {
            followingNumberChanged: followingNumberChanged, 
            newFollowingNumber: userDetails.following
          },
          followersMark: {
            followersMarkChanged: followersMarkChanged, 
            newFollowersMark: userDetails.followersMark
          },
          profile_pic: {
            profilePicChanged: profilePicChanged, 
            profilePicUrl: userDetails.profile_pic
          }
      }
      return payload 
    })
}

let callInstaPosts = async () => {
  let count = 0,
  maxTries = 5
  while(true){
    try {
      console.log('Entered try -> callInstaPosts')
      instaPosts = await instagramPosts(BOT_USER, {count: 1})
      //console.log('instaPosts', instaPosts)
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
      isIGTV = false,
      igTVUrl = '',
      singleMedia = ''

  if(responseTypename == 'GraphSidecar'){
   await convertGraphSideCar(responseUrl).then(shortcode => {
    shortcodeOrder = shortcode
   })
 
  }else{
    console.log('IG Post has a single media and it was saved')
    filePath = path.resolve('media', 'posts')
    console.log('response URL e filepath', responseUrl, filePath)
    singleMedia= await save(responseUrl, filePath).then(async res => {
      console.log('resAA', res)
      isIGTV = res.isIGTV
      igTVUrl = res.source
      let fileName = res.url 
      fileName = fileName.replace('https://www.instagram.com/p/', '')
      fileName = fileName.split()
      return fileName
    }) 
  }
  return {isIGTV: isIGTV, igTVUrl: igTVUrl}
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
    console.log('folder was empty before, posts')
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


let verifyFollowersMarks = async (userDetails) => {

  let followersMark = ''
  
  if(userDetails.followers >= 1000000 && userDetails.followers < 5000000){
    followersMark = '1M'
  }
  if(userDetails.followers >= 5000000 && userDetails.followers < 10000000){
    followersMark = '5M'
  }
  if(userDetails.followers >= 25000000 && userDetails.followers < 30000000){
    followersMark = '25M'
  }
  if(userDetails.followers >= 30000000 && userDetails.followers < 35000000){
    followersMark = '30M'
  }
  if(userDetails.followers >= 35000000 && userDetails.followers < 40000000){
    followersMark = '35M'
  }
  if(userDetails.followers >= 40000000 && userDetails.followers < 45000000){
    followersMark = '40M'
  }
  if(userDetails.followers >= 45000000 && userDetails.followers < 50000000){
    followersMark = '45M'
  }
  if(userDetails.followers >= 50000000 && userDetails.followers < 55000000){
    followersMark = '50M'
  }
  if(userDetails.followers >= 55000000 && userDetails.followers < 60000000){
    followersMark = '55M'
  }
  if(userDetails.followers >= 60000000 && userDetails.followers < 65000000){
    followersMark = '60M'
  }
  if(userDetails.followers >= 65000000 && userDetails.followers < 70000000){
    followersMark = '65M'
  }
  if(userDetails.followers >= 70000000 && userDetails.followers < 75000000){
    followersMark = '70M'
  }
  if(userDetails.followers >= 75000000 && userDetails.followers < 80000000){
    followersMark = '75M'
  }
  if(userDetails.followers >= 80000000 && userDetails.followers < 85000000){
    followersMark = '80M'
  }
  if(userDetails.followers >= 85000000 && userDetails.followers < 90000000){
    followersMark = '85M'
  }
  if(userDetails.followers >= 90000000 && userDetails.followers < 95000000){
    followersMark = '90M'
  }
  if(userDetails.followers >= 95000000 && userDetails.followers < 100000000){
    followersMark = '95M'
  }
  if(userDetails.followers >= 100000000 && userDetails.followers < 110000000){
    followersMark = '100M'
  }
  return followersMark
  
}

module.exports = {
  getInstagramPosts
}