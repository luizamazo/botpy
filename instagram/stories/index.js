const instory = require('instory')
let utils = require('../utils')
let path = require('path')
let axios = require('axios')
require('dotenv').config({path: '../../.env'})
const IG_USER = 'najwanimri'
const PRODUCTION  = 'https://examplePage.com'
const DEVELOPMENT = 'http://localhost:5000'
const URI = (process.env.NODE_ENV ? PRODUCTION : DEVELOPMENT)

let getInstagramStories = async (stories) => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories')
  let filePath = path.resolve('media', 'stories'),
  number = 0,
  storyUrl = '',
  instagramStory = [],
  onlyNewStories = []
 // let stories = await callInstory()

  if(stories.length > 0){


    for(value of stories){
      isStoryDuplicate = await verifyIfStoryIsDuplicate(mediaFromFolder, value.shortcode)
      console.log('Is story duplicate?', isStoryDuplicate)
      number++
      if(isStoryDuplicate == false){
        await saveStory(value.url, number, value.shortcode, value.exp)
        instagramStory.push([{
          'duplicate': false,
          'storyUrl': value.url,
          'shortcode': value.shortcode
        }])
      }else{
        instagramStory.push([{
          'duplicate': true
        }])
      } 
    }
      onlyNewStories = instagramStory.filter(story => {
        return story.duplicate != true
      }) 
      if(onlyNewStories.length == 0){
        onlyNewStories = [{'duplicate': true}]
      }
      checkExpiredStories(mediaFromFolder)
    }
  return onlyNewStories.length > 0 ? onlyNewStories : 'No new stories' 
}
  

let callInstory = async () => {
  let count = 0,
  maxTries = 5
  while(true){
    try {
      console.log('Entered try -> callInstory')
      stories = await instory(IG_USER).then(res => res)
      return stories
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

let saveStory = async (url, number, shortcode, expiring_at) => {
  let filePath = path.resolve('media', 'stories', `${number} - ${shortcode} [${expiring_at}]`)
  return await utils.download(url, filePath).then(res => {
    console.log('Story isnt a duplicate, it was downloaded and saved')
    return 'ok'
  })
}

let verifyIfStoryIsDuplicate = async (mediaFromFolder, shortcode) => {
  let flag = false
  if(mediaFromFolder.length == 0){
    console.log('verifyIfStoryIsDuplicate mas pasta eh vazia entao...fodase')
  }else{
    for(file of mediaFromFolder){
      if(file.includes(shortcode)){
        flag = true 
        break  
      }else{
        flag = false
      }
    }
  }
  return flag
}


let checkExpiredStories = async (mediaFromFolder) => {
  if(mediaFromFolder.length > 0){
    for(file of mediaFromFolder){
      let regex =  new RegExp(/\[(.*?)]/g),
      result = file.match(regex).toString().replace('[', '').replace(']', '')
      expirationDate = new Date(result * 1000),
      currentDate = new Date()
      console.log(`Story expiration date -> ${expirationDate} | Current Date -> ${currentDate}`)
      if(currentDate >= expirationDate){
        await utils.deleteFileFromFolder(file, 'stories')
      }
    }
  }
}


module.exports = {
  getInstagramStories
}


