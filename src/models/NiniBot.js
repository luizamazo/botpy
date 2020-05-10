const mongoose = require('mongoose')

const NiniBotSchema = new mongoose.Schema({
    posts: Object, 
    stories: Object
})

module.exports = mongoose.model('NiniBot', NiniBotSchema)