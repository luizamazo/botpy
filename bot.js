instagramPost = require('./instagram/posts/index.js')
instagramStory = require('./instagram/stories/index.js')
require('dotenv').config()
const { setIntervalAsync } = require('set-interval-async/dynamic')
const { spawn } = require('child_process')
const BOT_NAME = process.env.BOT_NAME
const BOT_USER = process.env.BOT_USER
const Shitgram = require('shitgram')
const NightStalker = require('night-stalker')

const { Session } = require('shitgram').Plugins;

let master = async () => {
  //  const shitgram = new Shitgram({username:'corongabot', password: 'vivemosnumasociedade'})
  //  const teste = await shitgram.getSessionID()
  const balanar = await NightStalker.loadBrowser();
  balanar.setUserName(BOT_USER);

  // Login is required for stories. Don't commit your credentials to version control!
  // The account also should not have 2FA enabled.
  await balanar.login("corongabot", "vivemosnumasociedade"); 

     setIntervalAsync(
        async () => {
            await callMaster(balanar)
        }, 20000) 
} 

let callMaster = async (balanar) => { 
   
 /*      
    let igPost = await instagramPost.getInstagramPosts()
    igPost = igPost[0]   
    
  if(igPost.duplicate == false){
        await childProcessInstagramPosts(igPost)
    }  */
   let igStory = await instagramStory.getInstagramStories(balanar)
   /*  console.log('no bot', igStory)
    for(value of igStory){ 
        if(value[0]){
            if(value[0].duplicate == false){ 
                console.log('chama child process storuies')
             //   await childProcessInstagramStories(value[0], igPost).then(res => console.log(res))
            }     
        } 
    }  */
   
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

let childProcessInstagramStories = async (igStory, igPost) => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        tweet = `[STORIES] ${igPost.username}: 
        
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