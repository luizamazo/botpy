const { spawn } = require('child_process')

const BOT_NAME = process.env.BOT_NAME
const BOT_USER = process.env.BOT_USER

const fullNameChanged = async newFullName => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false

        console.log('no cp full name', newFullName)
        
        tweet = `[UPDATE] ${BOT_USER} has a new full name: 

${newFullName} 
       
@BLACKPINK #${BOT_NAME}`

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

const bioChanged = async newBio => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        key = 'has a new bio:',
        flag = false
        if(newBio === ''){
            key = 'removed the bio'
        }
        tweet = `[UPDATE] ${BOT_USER} ${key}

${newBio}        

@BLACKPINK #${BOT_NAME}`

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

const externalUrlChanged = async newExternalUrl => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false

        tweet = `[UPDATE] ${BOT_USER} has a new external url: 

${newExternalUrl}     
   
@BLACKPINK #${BOT_NAME}`

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

const followingNumberChanged = async newFollowingNumber => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        
        tweet = `[UPDATE] ${BOT_USER} has a new profile pic: 

${newFollowingNumber}        
@BLACKPINK #${BOT_NAME}`

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

const followersMark = async newFollowersMark => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        
        tweet = `[UPDATE] ${BOT_USER} hits ${newFollowersMark}+ followers 

@BLACKPINK #${BOT_NAME}`

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

const profilePicChanged = async profilePicUrl => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false
        
        tweet = `[UPDATE] ${BOT_USER} has a new profile pic: 
        
${profilePicUrl} 
@BLACKPINK #${BOT_NAME}`

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


module.exports = {
    fullNameChanged,
    bioChanged,
    externalUrlChanged,
    followingNumberChanged,
    followersMark,
    profilePicChanged
}