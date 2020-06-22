require('dotenv').config()
const instagramPost = require('./instagram/posts/index.js')
const instagramStory = require('./instagram/stories/index.js')
const cpUser = require('./childProcessesUser.js')
const cpLibs = require('./childProcessesLibs.js')

const { setIntervalAsync } = require('set-interval-async/dynamic')

let master = async () => {
   setIntervalAsync(
    async () => {
        await callMaster()
    }, 20000)
}

let callMaster = async () => {
    let igPost = await instagramPost.getInstagramPosts() 
        igPost = igPost[0]   
    
    if(igPost.duplicate == false){
        await cpLibs.tweetInstagramPosts(igPost)
    }else{
        await postChangedUserDetails(igPost)
    }

  //  await handleStories()
}

let postChangedUserDetails = async igPost => {
    /* if(igPost.profile_pic.profilePicChanged){
        await cpUser.profilePicChanged(igPost.profile_pic.profilePicUrl)
    }
    if(igPost.full_name.fullNameChanged){
        await cpUser.fullNameChanged(igPost.full_name.newFullName)
    }
    if(igPost.bio.bioChanged){
        await cpUser.bioChanged(igPost.bio.newBio)
    }
    if(igPost.external_url.externalUrlChanged){
        if(igPost.external_url.newExternalUrl != null){
            await cpUser.externalUrlChanged(igPost.external_url.newExternalUrl)
        }
    } */
    console.log('doded', igPost)
    if(igPost.followersMark.followersMarkChanged){
        await cpUser.followersMark(igPost.followersMark.newFollowersMark)
    }
    /* if(igPost.following.followingNumberChanged){
        await cpUser.followingNumberChanged(igPost.following.newFollowingNumber)
    } */
}

let handleStories = async () => {
    let storiesToPost = {},
    stories = []
    let instaLoaderStories = await cpLibs.getInstaloaderStories()
    if(instaLoaderStories == 0){
        console.log('No new stories')
    }else{
        let json = JSON.parse("[" + instaLoaderStories + "]")
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