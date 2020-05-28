const mongoose = require('mongoose')

const BotSchema = new mongoose.Schema({
    botName: {type: String, unique: true},
    posts: Array, 
    stories: Array
})

module.exports = mongoose.model('Bot', BotSchema)