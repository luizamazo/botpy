const instagramPosts = require('instagram-posts');
const save = require('instagram-save');

var fs = require('fs'),
request = require('request');
 
(async () => {

    let response = await instagramPosts('renebaebae', {count: 25})

    if(response[2].__typename == 'GraphSidecar'){
        response[2].url = response[2].url + '?__a=1'
        request.get(response[2].url, function(err,res,body){
         
          body = JSON.parse(body)
          let media = body.graphql.shortcode_media
          media = Object.entries(media.edge_sidecar_to_children)
          let uri = []

          for (const [key, value] of media) {
            
            let node = value.map((novo) => {
             return novo.node
            })
    
            for(child of node){
              if(child.is_video){
                uri.push({
                  'url': child.video_url,
                  'shortcode': child.shortcode
                })
              }else{
                uri.push({
                  'url': child.display_url,
                  'shortcode': child.shortcode
                })
              }
            } 
          }
        
          for(value of uri){  
            download(value.url, value.shortcode, function(){
              console.log('done')
            })
          }
      })  
    }else{
    save(response[1].url, './media').then(res => {
      console.log(res);
    })
  }

  
   
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