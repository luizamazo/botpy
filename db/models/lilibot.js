const mongoose = require('../database')

const LiliBotSchema = new mongoose.Schema({  
    posts: {type: Object},  
    stories: {type: Object}
})

const LiliBot = mongoose.model('LiliBot', LiliBotSchema)
     