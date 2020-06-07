const instory = require('instory')
let utils = require('../utils')
let path = require('path')
let axios = require('axios')
require('dotenv').config({path: '../../.env'})
const IG_USER = 'albxreche'
const PRODUCTION  = 'https://examplePage.com'
const DEVELOPMENT = 'http://localhost:5000'
const URI = (process.env.NODE_ENV ? PRODUCTION : DEVELOPMENT)

let getInstagramStories = async (stories) => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories')
  let filePath = path.resolve('media', 'stories'),
  number = 0,
  storyUrl = '',
  instagramStory = [],
  onlyNewStories = [],
  databaseStories = {}
 // let stories = await callInstory()

  if(stories.length > 0){

    databaseStories = await callStoriesFromDatabase()
    databaseStories = databaseStories.stories

    for(value of stories){
      value = value[0]
      //console.log('res', new Date(value.expiring_at * 1000))
      isStoryDuplicate = await verifyIfStoryIsDuplicate(mediaFromFolder, value.shortcode, databaseStories)
      console.log('Is story duplicate?', isStoryDuplicate)
      number++
      if(isStoryDuplicate == false){
        await saveStory(value.url, number, value.shortcode, value.expiring_at)
        await updateStoriesOnDatabase(value.shortcode, value.expiring_at)

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
      checkExpiredStories(mediaFromFolder, databaseStories)
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

let verifyIfStoryIsDuplicate = async (mediaFromFolder, shortcode, databaseStories) => {
  let flag = false
  if(mediaFromFolder.length == 0){
    console.log('verifyIfStoryIsDuplicate mas pasta eh vazia entao...')
    flag = await verifyIfStoryIsDuplicateDataBase(shortcode, databaseStories)
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

let verifyIfStoryIsDuplicateDataBase = async (storyShortcode, databaseStories) => {
  console.log("Folder was empty, calling database to verify if story is duplicate storyShortcode...", databaseStories)
  let flag = false
  if(databaseStories.length == 0){
    flag = false
  }else{
    for(file of databaseStories){
      if(file.includes(storyShortcode)){
        flag = true 
        console.log(`Duplicate story, file ${file}`)
        break  
      }else{
        flag = false
        console.log(`${file} doesnt include ${storyShortcode}`)
      }
    } 
  }
  return flag
}

let callStoriesFromDatabase = async () => {
  return await axios({url: `${URI}/show/${process.env.BOT_NAME}`, method: 'GET' })
      .then(response => {
        console.log('response do callStoriesFromDatabase', response.data)
        return response.data
      }).catch(error => {
        console.error(error)
      }) 
}

let updateStoriesOnDatabase = async (shortcode, expiring_at) => {
  shortcode = `${shortcode} [${expiring_at}]` 
  return await axios({url: `${URI}/updateStories/${process.env.BOT_NAME}`, method: 'PUT', data: {stories: shortcode}})
        .then(response => {
         console.log('response.data no update stories database', response.data)
        }).catch(error => {
          console.error(error)
        })  
}


let checkExpiredStories = async (mediaFromFolder, databaseStories) => {
  console.log('checkExpiredStories', databaseStories)
  
      for(file of databaseStories){
        console.log('file of database & dbstories', file, databaseStories)

        let regex =  new RegExp(/\[(.*?)]/g)
      
        let result = file.match(regex).toString().replace('[', '').replace(']', ''),
        expirationDate = new Date(result * 1000),
        currentDate = new Date()
        console.log(result)
        console.log(`FROM DB: Story expiration date -> ${expirationDate} | Current Date -> ${currentDate}`)
        if(currentDate >= expirationDate){
          await deleteFileFromDatabase(file)
        }
     
  }
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

let deleteFileFromDatabase = async (file) =>{
  console.log('no deleteFileFromDatabase, file to be deleted is', file)
  return await axios({url: `${URI}/deleteStory/${process.env.BOT_NAME}`, method: 'PUT', data: {story: file}})
        .then(response => {
         console.log(response.data)
        }).catch(error => {
          console.error(error)
        })  
}


module.exports = {
  getInstagramStories
}


