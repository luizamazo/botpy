const instory = require('instory')
let utils = require('../utils')
const IG_USER = 'corongabot'

let getInstagramStories = async () => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories'),
  path = '../../media/stories/',
  number = 0,
  storyUrl = '',
  instagramStory = [],
  stories = await callInstory()

  for(value of stories){
    value = value[0]
    //console.log('res', new Date(value.expiring_at * 1000))
    isStoryDuplicate = await verifyIfStoryIsDuplicate(mediaFromFolder, value.shortcode)
    console.log('Is story duplicate?', isStoryDuplicate)
    number++
    if(isStoryDuplicate == false){
      await saveStory(value.url, number, value.shortcode, value.expiring_at, path)
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

    let onlyNewStories = instagramStory.filter(story => {
      return story.duplicate != true
    }) 
   
    if(onlyNewStories.length == 0){
      onlyNewStories = [{'duplicate': true}]
    }
   
    checkExpiredStories(mediaFromFolder)
    
  return onlyNewStories
}

let callInstory = async () => {
  let count = 0,
  maxTries = 5
  while(true){
    try {
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

let saveStory = async (url, number, shortcode, expiring_at, path) => {
  return await utils.download(url, `${number} - ${shortcode} [${expiring_at}]`, path).then(res => {
    console.log('Story isnt a duplicate, it was downloaded and saved')
    return 'ok'
  })
}

let verifyIfStoryIsDuplicate = async (media, shortcode) => {
  let flag = false
  if(media.length == 0){
    return false
  }else{
    for(file of media){
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

let checkExpiredStories = async mediaFromFolder => {

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


module.exports = {
  getInstagramStories
}


