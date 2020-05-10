const mongoose = require('mongoose')

const LiliBotSchema = new mongoose.Schema({
    posts: Object, 
    stories: Object
})

module.exports = mongoose.model('LiliBot', LiliBotSchema)