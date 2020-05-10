const fs = require('fs')
const AWS = require('aws-sdk')
let utils = require('./utils')
require("dotenv").config({path:".env"})

const ID = 'AKIAIVLFUZRCMCBCPERA'
const SECRET = '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'
const REGION = process.env.AWS_REGION

const BUCKET_NAME = 'luidysbotpy'

AWS.config = new AWS.Config()
AWS.config.accessKeyId = ID
AWS.config.secretAccessKey = SECRET

const s3 = new AWS.S3()

let teste = async () => {
    console.log(SECRET)
    let mediaSaved = await utils.getMediaFromFolder('posts')
    for(file of mediaSaved){
        await uploadFile(file)
    }
}

const uploadFile = async (file) => {
    // Read content from the file
    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: file
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    })
}

teste()