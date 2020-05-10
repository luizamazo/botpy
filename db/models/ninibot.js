const mongoose = require('../database')

const NiniBotSchema = new mongoose.Schema({  
    posts: {type: Object},  
    stories: {type: Object}
})

const NiniBot = mongoose.model('NiniBot', NiniBotSchema)
     