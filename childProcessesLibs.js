const { spawn } = require('child_process')

const BOT_NAME = process.env.BOT_NAME
const BOT_USER = process.env.BOT_USER

let tweetInstagramPosts = async igPost => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false,
        text = igPost.text

        if(text.length > 280){
            diff = text.length - 183
        //  diff = text.length -  277
            text = text.slice(0, text.length - diff)
            text = text + '...'
        }

        if(igPost.isIGTV){
            tweet = `[IGTV] ${BOT_USER}: ${text} 

${igPost.igTVUrl}
${igPost.url} @ygofficialblink #${BOT_NAME}`
        }else{
            tweet = `[POST${igPost.count}] ${BOT_USER}: ${text} 
     
${igPost.url} @ygofficialblink #${BOT_NAME}`
        }
        
        

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

let tweetInstagramStories = async (igStory) => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        tweet = `[STORIES] ${BOT_USER}: 
        
${igStory.storyUrl} @ygofficialblink #${BOT_NAME}`

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

let getInstaloaderStories = async () => {
    return new Promise(function(resolve, reject) {
        let result = {}
        const child = spawn('python', ['instaloader/download-stories.py', BOT_USER])

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



module.exports = {
    tweetInstagramPosts,
    tweetInstagramStories,
    getInstaloaderStories
}