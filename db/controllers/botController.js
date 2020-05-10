const express = require('express')
const BotSoo = require('../models/BotSoo')
const BotSe = require('../models/BotSe')
const NiniBot = require('../models/NiniBot')
const LiliBot = require('../models/LiliBot')

const router = express.Router()

router.post('/registerMedia', async(req, res) => {
    try{
        console.log('antes do verify')
        await verifyBotType(req.body)
        return res
    }catch(error){
        console.error(error)
        return error
    }
})

let verifyBotType = async (body) => {
    console.log('caiu no verfiy', body)
    let bot = body.botType,
    posts = body.posts,
    stories = body.stories
    
    if(bot == 'botsoo'){
        await BotSoo.create(posts, stories) 
    }
}

module.exports = app => app.use('/botpy', router)