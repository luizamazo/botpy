const instory = require('instory')
let utils = require('../utils')

let getInstagramStories = async () => {

  let mediaFromFolder = await utils.getMediaFromFolder('stories'),
  path = '././media/stories/',
  number = 0
 // console.log('mediafromfolder', mediaFromFolder)
  instory('corongabot').then(async response => {
  
    for(value of response){
     // console.log('value', value)
      value = value[0]
      isStoryDuplicate = await verifyIfStoryIsDuplicate(mediaFromFolder, value.shortcode)
      console.log('is story duplicate on return', isStoryDuplicate)
      number++
      if(isStoryDuplicate == false){
        utils.download(value.url, `${number} - ` + value.shortcode, path, function(){
          console.log('isStoryDuplicate = false, logo fez download')
        })
      }
    }
     
  })
}

let verifyIfStoryIsDuplicate = async (media, shortcode) => {
  let flag = false
  console.log('media', media)
  if(media.length == 0){
    return false
  }else{
      for(file of media){
          console.log('shortcode', shortcode)
          if(file.includes(shortcode)){
            console.log(`arquivo duplicado, file ${file} | shortcode ${shortcode}`)
            flag = true 
            break  
          }else{
            flag = false 
            console.log(`nao tinha ainda o arquivo, file ${file} | shortcode ${shortcode}`)
            break 
          }
      }
  }
  return flag
}

module.exports = {
  getInstagramStories
}


