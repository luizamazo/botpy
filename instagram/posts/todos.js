const instagramPosts = require('instagram-posts');
const save = require('instagram-save');

var fs = require('fs'),
request = require('request');
 
(async () => {

    let response = await instagramPosts('renebaebae', {count: 2})

    Object.entries(response).forEach((value, index) => {
      response[index] 
    })
  
   
})();

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    var type =  res.headers['content-type'];
    type = type.substring(type.indexOf("/") + 1);

    request(uri).pipe(fs.createWriteStream('../../media/' + [filename + '.' + type])).on('close', callback);
  });
};