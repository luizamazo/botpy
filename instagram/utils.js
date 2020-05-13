let fs = require('fs'),
request = require('request');
let path = require('path');

let download = async (uri, filePath) => {
  return new Promise(function(resolve, reject) {
    request.head(uri, function(err, res, body){
     // console.log('content-type:', res.headers['content-type'])
     // console.log('content-length:', res.headers['content-length'])
      if(err){
        console.log(err)
      }else{ 
        let type =  res.headers['content-type']
        type = type.substring(type.indexOf("/") + 1)
    
        request(uri).pipe(fs.createWriteStream(`${filePath}.${type}`)).on('finish', resolve)
      }
    })
  }
)}

let getMediaFromFolder = async (folder) => {
  return new Promise(function(resolve, reject) {
    let filePath = path.resolve('media', folder)
    fs.readdir(filePath, function(err, files){
      let media = []
      if(err){
          console.log(err)
          reject(err)
      }else{
          files.forEach(function(file){
              media.push(file)
          })
          resolve(media)
      }
    })
  }) 
}

let deleteMediaFromFolder = async (media, folder) => {
  console.log('media from deleteMediaFromFolder', media)
  for(file of media){
    imagePath = path.resolve('media', folder, file)
    fs.unlink(imagePath, function(err){
      if (err){
        console.log('ERROR: unable to delete media ' + imagePath);
      }
      else{
        console.log(imagePath + ' was deleted');
      }
    })
  }
}

let deleteFileFromFolder = async (file, folder) => {
  let mediaFromFolder = await getMediaFromFolder(folder)
  for(media of mediaFromFolder){
    if(media == file){
      let imagePath = path.resolve('media', folder, file)
      fs.unlink(imagePath, function(err){
        if (err){
          console.log('ERROR: unable to delete media ' + imagePath);
        }
        else{
          console.log(imagePath + ' was deleted');
        }
      })
      break
    }
  }
}
  
  module.exports = {
      download,
      getMediaFromFolder,
      deleteMediaFromFolder,
      deleteFileFromFolder
  }