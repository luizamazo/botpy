let fs = require('fs'),
request = require('request');

let download = (uri, filename, callback) => {
    request.head(uri, function(err, res, body){
     // console.log('content-type:', res.headers['content-type'])
     // console.log('content-length:', res.headers['content-length'])
      let type =  res.headers['content-type']
      type = type.substring(type.indexOf("/") + 1)
      let path = '././media/'
     
      request(uri).pipe(fs.createWriteStream(`${path}` + [filename + '.' + type])).on('close', callback)
    })
  }
  
  module.exports = {
      download
  }