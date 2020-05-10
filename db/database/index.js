const mongoose = require('mongoose')
require('dotenv').config({path: '../.env'})

const db = process.env.MONGODB_URL

mongoose.connect(db, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

mongoose.Promise = global.Promise

module.exports = mongoose

/* 
let connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
} */