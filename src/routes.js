const express = require('express')
const BotController = require('./controllers/BotController')

const routes = express.Router()

routes.post('/register', BotController.store)
routes.get('/show/:botName', BotController.show)
routes.put('/updatePosts/:botName', BotController.updatePosts)
routes.put('/updateStories/:botName', BotController.updateStories)
routes.put('/deleteStory/:botName', BotController.deleteStory)


module.exports = routes