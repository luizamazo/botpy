const instagramPosts = require('instagram-posts');
const save = require('instagram-save');
const axios = require('axios'); 
let utils = require('../utils');
request = require('request');

let getInstagramPost = async () => {

    let response = await instagramPosts('corongabot', {count: 25})

    //aqui faço verificaçao
    let media = await saveMedia(response),
        username = response[0].username,
        text = response[0].text,
        time = response[0].time,
        typename = response[0].__typename
        
    text = text.replace('@', '@.')
  //console.log('response aki', response[0])
    let instagramPost = [{
      'typename': typename,
      'media': media,
      'username': username,
      'text': text,
      'time': time
    }]

    return instagramPost
}

let saveMedia = async (response) => {
  let responseTypename = response[0].__typename
  let responseUrl = response[0].url
  let shortcodeOrder = []
  let singleMedia = ''

  if(responseTypename == 'GraphSidecar'){
   await convertGraphSideCar(responseUrl).then(shortcode => {
    shortcodeOrder = shortcode
   })
  }else{
    singleMedia= await save(responseUrl, '../../media').then(res => {
      let fileName = res.url 
      fileName = fileName.replace('https://www.instagram.com/p/', '')
      return fileName
    })
  }

  return shortcodeOrder.length == 0 ? singleMedia : shortcodeOrder
}

let convertGraphSideCar = async responseUrl => {
  
    responseUrl = responseUrl + '?__a=1'
    let urlShortcode = []

    return await axios({url: responseUrl, method: 'GET' })
      .then(response => {
        let body = response.data
        let media = body.graphql.shortcode_media
        media = Object.entries(media.edge_sidecar_to_children)

        for(const[key, value] of media) {
          let node = value.map((novo) => {
            return novo.node
          })
          urlShortcode = getUrlShortCode(node)
        }
        
        let number = 0
        for(value of urlShortcode){  
          number++
          utils.download(value.url, `${number} - ` + value.shortcode, function(){
            //console.log('done')
          })
        } 
       
       shortcodeOrder = orderMedia(urlShortcode)
       return shortcodeOrder
      }).catch(error => {
        console.log(error)
      })
}

let getUrlShortCode = node => {
  let uri = []
  for(child of node){
   
    if(child.is_video){
      uri.push({
        'url': child.video_url,
        'shortcode': child.shortcode,
        'is_video': child.is_video
      })
    }else{
      uri.push({
        'url': child.display_url,
        'shortcode': child.shortcode,
        'is_video': child.is_video
      })
    }
  } 
  return uri
}

let orderMedia = urlShortcode => {
  let shortcodeOrder = urlShortcode.map(value => {
    return value.shortcode
  })
  return shortcodeOrder
}

/*(async () => {
  let teste = await getInstagramPost()
  console.log(teste)
})
(); */

module.exports = {
  getInstagramPost
}