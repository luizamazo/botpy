const instory = require('instory')
let utils = require('../utils')

let getInstagramStories = async () => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories'),
  path = '././media/stories/',
  number = 0,
  storyUrl = '',
  instagramStory = [],
  stories = await instory('roses_are_rosie').then(res => res)
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
      instagramStory.push({
        'duplicate': false,
        'storyUrl': value.url,
        'shortcode': value.shortcode
      })
    }else{
      instagramStory = [{
        'duplicate': true
      }]
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

let saveStory = async (url, number, shortcode, expiring_at, path) => {
  return utils.download(url, `${number} - ${shortcode} [${expiring_at}]`, path).then(res => {
    console.log('isStoryDuplicate = false, logo fez download')
    return 'ok'
  })
}

let verifyIfStoryIsDuplicate = async (media, shortcode) => {
  let flag = false
//  console.log('media', media)
  if(media.length == 0){
    return false
  }else{
      for(file of media){
         // console.log(`file ${file} | shortcode ${shortcode}`)
          if(file.includes(shortcode)){
          //  console.log(`arquivo duplicado`)
            flag = true 
            break  
          }else{
            flag = false 
         //   console.log(`nao tinha ainda o arquivo`)
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

    /* expirationDate Sat Sep 15 2018 09:29:14 GMT-0400 (GMT-04:00) | currentDate Wed Apr 15 2020 03:25:22 GMT-0400 (GMT-04:00)
expirationDate Thu Apr 16 2020 02:22:34 GMT-0400 (GMT-04:00) | currentDate Wed Apr 15 2020 03:25:22 GMT-0400 (GMT-04:00)
expirationDate Thu Apr 16 2020 05:09:14 GMT-0400 (GMT-04:00) | currentDate Wed Apr 15 2020 03:25:22 GMT-0400 (GMT-04:00)        
expirationDate Thu Apr 16 2020 02:22:14 GMT-0400 (GMT-04:00) | currentDate Wed Apr 15 2020 03:25:22 GMT-0400 (GMT-04:00)        
expirationDate Thu Apr 16 2020 02:22:32 GMT-0400 (GMT-04:00) | currentDate Wed Apr 15 2020 03:25:22 GMT-0400 (GMT-04:00) */
     
  }
   
}


module.exports = {
  getInstagramStories
}


