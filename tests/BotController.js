const BotSoo = require('../models/BotSoo')
const BotSe = require('../models/BotSe')
const NiniBot = require('../models/NiniBot')
const LiliBot = require('../models/LiliBot')

module.exports = {
    async store(req, res){
        let bot = await verifyBotTypeCreate(req.body)
        return res.json(bot)
    },
    async show(req, res){
        let botName = req.params.botName,
            botCollection = {},
        
        botCollection = await verifyBotTypeShow(botName)
        console.log(botCollection)
        return res.json(botCollection)
    },
    async update(req, res){
        let 
    }

}

let verifyBotTypeCreate = async (body) => {
    let botType = body.botType,
    posts = body.posts,
    stories = body.stories,
    bot = {}
    
    if(botType == 'botsoo'){
        bot = await BotSoo.create({posts, stories})
    }else if(botType == 'botse'){
        bot = await BotSoo.create({posts, stories})
    }else if(botType == 'ninibot'){
        bot = await BotSoo.create({posts, stories})
    }else if(botType == 'lilibot'){
        bot = await BotSoo.create({posts, stories})
    }
    return bot
}

let verifyBotTypeShow = async (botName) => {
    let botCollection = {}
    if(botName == 'botsoo'){
        botCollection = await getBotSooCollection()
    }else if(botName == 'botse'){
        botCollection = await getBotSeCollection()
    }else if(botName == 'ninibot'){
        botCollection = await getNiniBotCollection()
    }else if(botName == 'lilibot'){
        botCollection = await getLiliBotCollection()
    }
    return botCollection
}


let convertBotCollection = async (botName, result) => {
    return {
        botName: botName,
        id: result.id,
        posts: result.posts,
        stories: result.stories 
    }
}

let getBotSooCollection = async () => {
    let botCollection = {}
    await BotSoo.find({}, async function(err, result) { 
        if(err){throw err}
        result = result[0]
        botCollection = await convertBotCollection('botsoo', result)
    })
    return botCollection
}


let getBotSeCollection = async () => {
    let botCollection = {}
    await BotSe.find({}, async function(err, result) { 
        if(err){throw err}
        result = result[0]
        botCollection = await convertBotCollection('botse', result)
    })
    return botCollection
}


let getNiniBotCollection = async () => {
    let botCollection = {}
    await NiniBot.find({}, async function(err, result) { 
        if(err){throw err}
        result = result[0]
        botCollection = await convertBotCollection('ninibot', result)
    })
    return botCollection
}


let getLiliBotCollection = async () => {
    let botCollection = {}
    await LiliBot.find({}, async function(err, result) { 
        if(err){throw err}
        result = result[0]
        botCollection = await convertBotCollection('lilibot', result)
    })
    return botCollection
}

