const { spawn } = require('child_process')

const BOT_NAME = process.env.BOT_NAME
const BOT_USER = process.env.BOT_USER


let getInstaloaderPosts = async () => {
    return new Promise(function(resolve, reject) {
        let result = {}
        console.log('abrindo procsso de download posts')
        const child = spawn('python', ['instaloader/download-posts.py', BOT_USER])

        child.stdout.on('data', (data) => {
            result = data
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`getInstaloaderPosts child process exited with code ${code}`)
            resolve(result.toString())
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
            console.log(`getInstaloaderStories child process exited with code ${code}`)
            resolve(result.toString())
        })   
    })
}

let handleUserDetails = async () => {
    return new Promise(function(resolve, reject) {
        let result = {},
        payload = [BOT_USER, BOT_NAME]
        const child = spawn('python', ['profile.py', payload])

        child.stdout.on('data', (data) => {
            console.log('stdout user details', data)
            result = data
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`handleUserDetails child process exited with code ${code}`)
            resolve(result.toString())
        })   
    })
}

let tweetInstagramPosts = async igPost => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
            flag = false,
            postPayload = igPost.postPayload
            caption = postPayload.caption
        
        if(postPayload.isIGTV){
            caption = postPayload.title + caption
        }
        
        if(caption.length > 280){
            diff = caption.length - 183
        //  diff = caption.length -  277
            caption = caption.slice(0, caption.length - diff)
            caption = caption + '...'
        }

        if(postPayload.isIGTV){
            tweet = `[IGTV] ${BOT_USER}: ${caption} 

${postPayload.IGTVUrl}
${igPost.postUrl} @BLACKPINK #${BOT_NAME}`
        }else{
            tweet = `[POST${igPost.postMediaCount}] ${BOT_USER}: ${caption} 
     
${igPost.postUrl} @BLACKPINK #${BOT_NAME}`
        }

        console.log('starting child process tweet ig posts...', tweet)
    
        const child = spawn('python', ['bot.py', tweet])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`tweetInstagramPosts child process exited with code ${code}`)
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
        
${igStory.storyUrl} @BLACKPINK #${BOT_NAME}`

        const child = spawn('python', ['bot.py', tweet, igStory.shortcode])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`tweetInstagramStories child process exited with code ${code}`)
            flag = true
            resolve(flag)
        })   
    })
}

let tweetRelevantComments = async (igPost) => {
    return new Promise(function(resolve, reject) {  
        
        //payload = [BOT_USER, igPost.postUrl, BOT_NAME, igPost.postPayload.media_id]
      //  console.log('payload no cplibs commets', igPost, payload)
        let payload = []
        const child = spawn('python', ['comments.py', payload])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`tweetRelevantComments child process exited with code ${code}`)
            flag = true
            resolve(flag)
        })   
    })
}


let checkInstaLive = async () => {
    return new Promise(function(resolve, reject) {  
        
        payload = [BOT_USER, BOT_NAME]
        const child = spawn('python', ['lives.py', payload])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`checkInstaLive child process exited with code ${code}`)
            flag = true
            resolve(flag)
        })   
    })
}




module.exports = {
    getInstaloaderPosts,
    getInstaloaderStories,
    handleUserDetails,
    tweetInstagramPosts,
    tweetInstagramStories,
    tweetRelevantComments,
    checkInstaLive
}