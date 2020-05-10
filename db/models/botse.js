const mongoose = require('../database')

const BotSeSchema = new mongoose.Schema({  
    posts: {type: Object},  
    stories: {type: Object}
})

const BotSe = mongoose.model('BotSe', BotSeSchema)
     