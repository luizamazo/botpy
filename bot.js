instagram = require('./instagram/posts/index.js');
const { spawn } = require('child_process');

let master = async () => {
   
        let igPost = await instagram.getInstagramPost()
       /* console.log(igPost)
        tweet = `|POST| reee: ${igPost.text}`
        tweet = encode_utf8(tweet)
        
        if(igPost){
            const cuzao = spawn('python', ['bot.py', tweet]);

            cuzao.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            
            cuzao.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
            });
            
            cuzao.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
           // console.log('kosjdo', instagramMedia.length)
        }  */ 
        
}

master()

function encode_utf8(string){
  return unescape(encodeURIComponent(string));
}

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