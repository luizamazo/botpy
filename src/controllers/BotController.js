const Bot = require('../models/Bot')

module.exports = {
    async store(req, res){
        let botName = req.body.botName,
            posts = req.body.posts,
            stories = req.body.stories,
            bot = {}

        bot = await Bot.create({botName, posts, stories})
        return res.json(bot)
    },
    async show(req, res){
        let botName = req.params.botName,
            botCollection = {}
        console.log('show', botName, botCollection)
        botCollection = await getBotCollection(botName)
        console.log('res do show', botCollection)
        return res.json(botCollection)
    },
    async updatePosts(req, res){
        let botName = req.params.botName,
            posts = req.body.posts
            
        let doc = await Bot.findOneAndUpdate(
            {botName: botName}, 
            {$set: {posts: posts}}, 
            {new: true, useFindAndModify: false})
      
        return res.json(doc) 
    },
    async updateStories(req, res){
        let botName = req.params.botName,
            storiesReq = req.body.stories
            console.log('entrou no update stories, botname e stories req', botName, storiesReq)
        let botCollection = await getBotCollection(botName),
            doc = {}
        console.log('getbotcolecion', botCollection)
       // stories[0] != 'Empty' ? (console.log('eh empty'), stories.push(storiesReq)) : stories = storiesReq
        
       if(botCollection.length == 0){
            doc = await Bot.findOneAndUpdate(
                {botName: botName}, 
                {$set: {stories: storiesReq}}, 
                {new: true, useFindAndModify: false}).then(res => {
                    
                     console.log('doc dps do update quando primeiro eh empty', res)
                })
        }else{
            doc = await Bot.findOneAndUpdate(
                {botName: botName}, 
                {$push: {stories: storiesReq}},
                {new: true, useFindAndModify: false})
            console.log('doc dps do update', doc)
        }
       
        return res.json(doc)
    },
    async deleteStory(req, res){
        let botName = req.params.botName,
            story = req.body.story
            console.log('entrou no delete stories, botname e stories req', botName, story)
        let botCollection = await getBotCollection(botName)
        console.log('getbotcolecion', botCollection)
        stories = botCollection.stories
        let filteredStories = stories.filter(value => {
            if(story != value){
                return value
            }
        }) 
        console.log('filteredStories', filteredStories)
        let doc = await Bot.findOneAndUpdate(
            {botName: botName}, 
            {$set: {stories: filteredStories}}, 
            {new: true, useFindAndModify: false})
            console.log('doc dps do update', doc)
        return res.json(doc) 
    }
}

let convertBotCollection = async (botName, result) => {
    return {
        botName: botName,
        posts: result.posts,
        stories: result.stories 
    }
}

let getBotCollection = async (botName) => {
    let botCollection = {}
    botCollection = await Bot.find({botName: botName})
        .then(response => {
           // console.log('respose do get col ', response)
           console.log('respose do get col', response, response.length)
            response.length == 0 ? response : response = response[0]
            console.log('respose depois', response, response.length)
            return response
        }).catch(err => {
            console.error(err)
        })
    return botCollection
}


