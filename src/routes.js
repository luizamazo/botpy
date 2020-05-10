const express = require('express')
const BotController = require('./controllers/BotController')

const routes = express.Router()

routes.post('/register', BotController.store)

module.exports = routes