const BotSoo = require('../models/BotSoo')
const BotSe = require('../models/BotSe')
const NiniBot = require('../models/NiniBot')
const LiliBot = require('../models/LiliBot')

module.exports = {
    async store(req, res){
        let bot = await verifyBotType(req.body)
        return res.json(bot)
    }
}

let verifyBotType = async (body) => {
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