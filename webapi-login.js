const Instagram = require('instagram-web-api')
const FileCookieStore = require('tough-cookie-filestore2')
 
const username = 'noctedaemones'
const password = 'letskillthislove' // Only required when no cookies are stored yet
 
const cookieStore = new FileCookieStore('./cookies.json')
const client = new Instagram({ cookieStore })
 
;(async () => {
 
 
  await client.login().then(res => {console.log('res', res)})
 
  await client.getMediaComments({ shortcode: 'CCFbb2vDEAM', first: '49', after: '' }).catch((error) => {
    console.log(error);
  })
  .then((response) => {
    console.log('response', response);
    for(value of response.edges){
        if(value.node.edge_threaded_comments.count >= 1){
            for(file of value.node.edge_threaded_comments.edges){
                console.log('file0', file)
            }
            
        }
        console.log('alue', value)
    }
     //The query cursor 'after' maybe return an array, if array you need to convert like this: 
   let pointer = response.page_info.end_cursor;
   // this will try to convert array to json stringify
     try{
             pointer = JSON.parse(pointer);
             pointer = JSON.stringify(pointer);
             console.log('point', pointer)
     }catch(e){
             console.log('Pointer is not array!, dont need to be converted!');
     }
  });
  
 
})()