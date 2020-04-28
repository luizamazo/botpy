instagramPost = require('./instagram/posts/index.js')
instagramStory = require('./instagram/stories/index.js')
const { spawn } = require('child_process')
const BOT_NAME = 'botpy'

let master = async () => {

        igPost = await instagramPost.getInstagramPosts(),
       // igStory = await instagramStory.getInstagramStories(),
        igPost = igPost[0]
        let tweet = igPost.text
      
        console.log('unicode', toUnicode(tweet))
       // console.log('igstory', igStory)

        if(igPost.duplicate == false){
            await childProcessInstagramPosts(igPost)
        } 
        
        /* for(value of igStory){
            console.log('entrou nesa merda', value[0].shortcode)
            if(value[0].duplicate == false){ 
               
                await childProcessInstagramStories(value[0], igPost)
            }
        }  */
}

function toUnicode(str) {
	return str.split('').map(function (value, index, array) {
		var temp = value.charCodeAt(0).toString(16).toUpperCase();
		if (temp.length > 2) {
			return '\\u' + temp;
		}
		return value;
	}).join('');
}


let childProcessInstagramPosts = async igPost => {
    let tweet = ''
        tweet = `[POST] ${igPost.username}: ${igPost.text} ${igPost.count}

${igPost.url} #${BOT_NAME}`
       // tweet = toUnicode(tweet)
       tweet = encode_utf8(tweet)

        const child = spawn('python', ['bot.py', tweet])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
        }) 
}

let childProcessInstagramStories = async (igStory, igPost) => {
    console.log('igstory e igpost', igStory, igPost)
    let tweet = ''
        tweet = `[STORIES] ${igPost.username}: 

${igStory.storyUrl} #${BOT_NAME}`
        tweet = encode_utf8(tweet)

        const child = spawn('python', ['bot.py', tweet, igStory.shortcode])

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
        })   
}


function encode_utf8(string){
  return unescape(encodeURIComponent(string))
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