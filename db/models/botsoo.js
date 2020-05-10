const mongoose = require('../database')

const BotSooSchema = new mongoose.Schema({  
    posts: {type: Object},  
    stories: {type: Object}
})

const BotSoo = mongoose.model('BotSoo', BotSooSchema)

module.exports = BotSoo
     