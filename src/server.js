const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes')
require('dotenv').config({path: './.env'})

const app = express()
const db = process.env.MONGODB_URL

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(express.json())
app.use(routes)

app.listen(3000)