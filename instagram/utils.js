let fs = require('fs'),
request = require('request');

let download = (uri, filename, path, callback) => {
    request.head(uri, function(err, res, body){
     // console.log('content-type:', res.headers['content-type'])
     // console.log('content-length:', res.headers['content-length'])
      let type =  res.headers['content-type']
      type = type.substring(type.indexOf("/") + 1)
     
      request(uri).pipe(fs.createWriteStream(`${path}` + [filename + '.' + type])).on('close', callback)
    })
  }

let getMediaFromFolder = async (folder) => {
  return new Promise(function(resolve, reject) {
    fs.readdir(__dirname + './../media/' + folder + '/', function(err, files){
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
    imagePath = __dirname + './../media/' + folder + '/' + file
    fs.unlink(imagePath, function(err){
      if (err){
        console.log('ERROR: unable to delete media ' + imagePath);
      }
      else{
        console.log('media ' + imagePath + ' was deleted');
      }
    })
  }
}
  
  module.exports = {
      download,
      getMediaFromFolder,
      deleteMediaFromFolder
  }