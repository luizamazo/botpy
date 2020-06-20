instagramPost = require('./instagram/posts/index.js')
instagramStory = require('./instagram/stories/index.js')
require('dotenv').config()
const { setIntervalAsync } = require('set-interval-async/dynamic')
const { spawn } = require('child_process')
const BOT_NAME = process.env.BOT_NAME
const BOT_USER = process.env.BOT_USER

let master = async () => {
   setIntervalAsync(
    async () => {
        await callMaster()
    }, 20000)
}


let callMaster = async () => {
     let igPost = await instagramPost.getInstagramPosts()
     /*    igPost = igPost[0]   
    
    if(igPost.duplicate == false){
        await childProcessInstagramPosts(igPost)
    }   */
   // await childProcessComments()
  /*   let teste = {},
    stories = []
    let obj = await childProcessInstaloaderStories()
    if(obj == 0){
        console.log('No new stories')
    }else{
        let json = JSON.parse("[" + obj + "]")
        stories = json[0].reverse()
        teste = await instagramStory.getInstagramStories(stories)

        console.log('TESTE', teste)
        for(value of teste){ 
            if(value[0]){
                if(value[0].duplicate == false){ 
                    console.log('call ig stories child process')
                    await childProcessInstagramStories(value[0]).then(res => console.log(res))
                }     
            } 
        } 
    }  */
  //  let igStory = await instagramStory.getInstagramStories()
   
}

let childProcessComments = async () => {
    return new Promise(function(resolve, reject) {
        let result = ''
        const child = spawn('python', ['instaloader/comments.py', BOT_USER])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
            result = data
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            resolve(result)
        })   
    })
}

let childProcessInstaloaderStories = async () => {
    return new Promise(function(resolve, reject) {
        let result = {}
        const child = spawn('python', ['instaloader/download-stories.py'])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
            result = data
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            resolve(result.toString())
        })   
    })
}


let childProcessInstagramPosts = async igPost => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false,
        text = igPost.text

        if(text.length > 280){
            diff = text.length - 199
        //  diff = text.length -  277
            text = text.slice(0, text.length - diff)
            text = text + '...'
        }
        
        tweet = `[POST${igPost.count}] ${igPost.username}: ${text} 
        
${igPost.url} #${BOT_NAME}`

        const child = spawn('python', ['bot.py', tweet])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            flag = true
            resolve(flag)
        }) 
    })
}

let childProcessInstagramStories = async (igStory) => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        tweet = `[STORIES] ${BOT_USER}: 
        
${igStory.storyUrl} #${BOT_NAME}`

        const child = spawn('python', ['bot.py', tweet, igStory.shortcode])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            flag = true
            resolve(flag)
        })   
    })
}

master()