instagramPost = require('./instagram/posts/index.js')
instagramStory = require('./instagram/stories/index.js')
const { setIntervalAsync } = require('set-interval-async/dynamic')
const { spawn } = require('child_process')
const BOT_NAME = 'botpy'

let master = async () => {
    setIntervalAsync(
        async () => {
          await callMaster()
        },
        1000
      )
       
} 

let callMaster = async () => {
    
    igPost = await instagramPost.getInstagramPosts(),
    igStory = await instagramStory.getInstagramStories(),
    igPost = igPost[0],
    count = 0,
    flag = false

    return new Promise(async function(resolve, reject) {
        if(igPost.duplicate == false){
            flag = await childProcessInstagramPosts(igPost)
            flag == true ? (count++, flag = false) : count
        } 
        console.log('no master igstory', igStory)
        for(value of igStory){
            if(value[0].duplicate == false){ 
                flag = await childProcessInstagramStories(value[0], igPost).then(res => console.log(res))
                flag == true ? (count++, flag = false) : count
            }
         }  
         if(count == 2){
             resolve()
         }
    })
}

let childProcessInstagramPosts = async igPost => {
    return new Promise(function(resolve, reject) {
        let tweet = '',
        flag = false,
        text = igPost.text

        if(text.length > 280){
            diff = text.length - 210
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
        console.log('shortcode do js',  igStory.shortcode)
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


function encode_utf8(string){
  return unescape(encodeURIComponent(string))
}


function toUnicode(str) {
	return str.split('').map(function (value, index, array) {
		var temp = value.charCodeAt(0).toString(16).toUpperCase()
		if (temp.length > 2) {
			return '\\u' + temp;
		}
		return value;
	}).join('')
}

master()

/*const { spawn } = require('child_process');
const oi = ['arguumento', 'oaoaoa']
const cuzao = spawn('python', ['bot.py', oi]);

cuzao.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

cuzao.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

cuzao.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
*/