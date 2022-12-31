require('dotenv').config()
const instagramPost = require('./instagram/posts/index.js')
const instagramStory = require('./instagram/stories/index.js')
const cpUser = require('./childProcessesUser.js')
const cpLibs = require('./childProcessesLibs.js')
const LocalStorage = require('node-localstorage').LocalStorage
const localStorage = new LocalStorage('./storage')
const { setIntervalAsync } = require('set-interval-async/dynamic')

let master = async () => {
   setIntervalAsync(
    async () => {
        await callMaster()
    }, 30000)
}

let callMaster = async () => {
    //await cpLibs.tweetRelevantComments()
   // await cpLibs.checkInstaLive()
    let result = await cpLibs.getInstaloaderPosts()
    result = result.replace(/'/g, '"')
    console.log('result depois do replace', result)
    let payload = JSON.parse(result), 
        igPost = await instagramPost.getInstagramPosts(payload)
        igPost = igPost[0]
        console.log('ig post n bot.js', igPost)
    /* if(igPost.duplicate == false){
        await cpLibs.tweetInstagramPosts(igPost)
    }else{
        console.log('duplicate true')
        await cpLibs.handleUserDetails()
        await handleComments(igPost)
    }
    
    await handleStories()  */
}

let handleComments = async (igPost) => {
    count = localStorage.getItem('count')
    searchForComments = localStorage.getItem('searchForComments')
    console.log(`
        NO INICIO
        count ${count}
        searchForComments ${searchForComments}
    `)
    if(searchForComments == null){
        localStorage.setItem('searchForComments', true)
        searchForComments = localStorage.getItem('searchForComments')
    }
    if(count == null){
        localStorage.setItem('count', 1)
        count = localStorage.getItem('count')
    }
    count = parseInt(count)
    console.log(`
        NO MEIO
        count ${count}
        searchForComments ${searchForComments}
    `)
    if(count == 1){
      count++
      localStorage.setItem('count', count)
      console.log('count == 1, novo valor de count', count)
    }else if(count == 2){
      if(searchForComments == 'true'){ 
        console.log('chama a lib pra fazer search de coments')
        await cpLibs.tweetRelevantComments(igPost)
      }else{
        console.log('nao deve chamar a lib de search comments, pulou a vez')
      }
      if(searchForComments == 'true'){
        localStorage.setItem('searchForComments', false)
      }else{
        localStorage.setItem('searchForComments', true)
      }
      localStorage.setItem('count', 1)
    }
}

let handleStories = async () => {
    let storiesToPost = {},
    stories = []
    let instaLoaderStories = await cpLibs.getInstaloaderStories()
    if(instaLoaderStories == 0){
        console.log('No new stories')
    }else{
        console.log('stories ', instaLoaderStories)
        let json = JSON.parse("[" + instaLoaderStories + "]")
        console.log('json', json)
        stories = json[0].reverse()
        storiesToPost = await instagramStory.getInstagramStories(stories)

        for(value of storiesToPost){ 
            if(value[0]){
                if(value[0].duplicate == false){ 
                    await cpLibs.tweetInstagramStories(value[0]).then(res => console.log(res))
                }     
            } 
        } 
    }  
}

master()