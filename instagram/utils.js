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

let readJson = async (jsonPath) => {
  return new Promise(function(resolve, reject) {
    fs.readFile(jsonPath, 'utf8', (err, jsonString) => {
      if(err){
        console.error('Reading of json file failed:', err)
      }
      try{
        const json = JSON.parse(jsonString)
        resolve(json)
      }catch(err){
        console.error('Error parsing JSON', err)
      }
    })
  })
}

let writeJson = async (jsonPath, content) => {
  const jsonString = JSON.stringify(content)
  fs.writeFile(jsonPath, jsonString, err => {
    if(err){
      console.error('Error writing JSON file', err)
    }else{
      console.log('Successfully wrote JSON file')
    }
  })
}

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

let getFilesFromFolder = async (filePath) => {
  return new Promise(function(resolve, reject) {
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
  console.log('media from deleteMediaFromFolder', media, 'folder', folder)
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

let deleteComments = async (files, folder) => {
  for(file of files){
    file_path = path.resolve('instagram', folder, file)
    if(!file.includes('relevantUsers')){
      fs.unlink(file_path, function(err){
        if (err){
          console.log('ERROR: unable to delete media ' + file_path);
        }
        else{
          console.log(file_path + ' was deleted');
        }
      })
    }
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
      readJson,
      writeJson,
      getMediaFromFolder,
      getFilesFromFolder,
      deleteMediaFromFolder,
      deleteFileFromFolder,
      deleteComments
  }