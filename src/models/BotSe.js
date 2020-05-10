const mongoose = require('mongoose')

const BotSeSchema = new mongoose.Schema({
    posts: Object, 
    stories: Object
})

module.exports = mongoose.model('BotSe', BotSeSchema)