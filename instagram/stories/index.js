const instory = require('instory')
let utils = require('../utils')
const IG_USER = 'albxreche'

let getInstagramStories = async () => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories'),
  path = '././media/stories/',
  number = 0,
  storyUrl = '',
  instagramStory = [],
  stories = await callInstory()
  console.log('stories', stories)

  for(value of stories){
    value = value[0]
    //console.log('res', new Date(value.expiring_at * 1000))
    isStoryDuplicate = await verifyIfStoryIsDuplicate(mediaFromFolder, value.shortcode)
    console.log('is story duplicate on return', isStoryDuplicate)
    number++
    if(isStoryDuplicate == false){
      let saved = await saveStory(value.url, number, value.shortcode, value.expiring_at, path)
      console.log('saved', saved)
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
      console.log('entrou no try do call instory')
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
  return utils.download(url, `${number} - ${shortcode} [${expiring_at}]`, path).then(res => {
    console.log('isStoryDuplicate = false, logo fez download')
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
    console.log(`expirationDate ${expirationDate} | currentDate ${currentDate}`)
    if(currentDate >= expirationDate){
      console.log('currentFile', file)
      await utils.deleteFileFromFolder(file, 'stories')
    }
  }
}


module.exports = {
  getInstagramStories
}


