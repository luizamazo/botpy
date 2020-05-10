const mongoose = require('mongoose')

const BotSooSchema = new mongoose.Schema({
    posts: Object, 
    stories: Object
})

module.exports = mongoose.model('BotSoo', BotSooSchema)