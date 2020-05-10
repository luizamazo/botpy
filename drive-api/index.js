const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const axios = require('axios'); 
require('dotenv').config({path: '../.env'})

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth, folder) {
  const drive = google.drive({version: 'v3', auth});
  let folder_id = getFolderID('ninibot-stories')

  drive.files.list({
    pageSize: 12,
    fields: 'nextPageToken, files(id, name)',
    q: "'" + folder_id + "' in parents"
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

let getFolderID = (folder) => {
  let folder_id = ''
  switch (folder) {
    case 'botsoo-posts':
      folder_id = process.env.BOTSOO_POSTS
      break;
    case 'botse-posts':
      folder_id = process.env.BOTSE_POSTS
      break;
    case 'ninibot-posts':
      folder_id = process.env.NINIBOT_POSTS
      break;
    case 'lilibot-posts':
      folder_id = process.env.LILIBOT_POSTS
      break;
    case 'botsoo-stories':
      folder_id = process.env.BOTSOO_STORIES
      break;
    case 'botse-stories':
      folder_id = process.env.BOTSE_STORIES
      break;
    case 'ninibot-stories':
      folder_id = process.env.NINIBOT_STORIES
      break;
    case 'lilibot-stories':
      folder_id = process.env.LILIBOT_STORIES
    break;
    default:
      break;
  }
  return folder_id
} 

let resumableUpload = async () => {
 const accessToken = 'ya29.a0Ae4lvC1YmG20fuN3K0UfsIIBpDZPA4l6HhV369W7bdLR_1aTD6CuTtNkenXdv1J8AMowWQe3ey0E7NW2hWFtwTq3TkmKfIkag9BT6AQZ-yWsdMXseJluD2ybJOyMjdh44C-jG1OYqQaqY22n_96jce4kOKwj16mKt2I' // Please set the access token.

 let file = 'C:/Users/luiza/Downloads/uni/botpy/media/posts/InitPost copy 2.jpg' // Please set the filename with the path.
 let folder_id = getFolderID('botsoo-posts')
 const fileSize = fs.statSync(file).size;

// 1. Retrieve session for resumable upload.
axios(
  {
    method: "POST",
    url:
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&addParents=${folder_id}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: "sample.jpg", mimeType: "image/jpg" })
  },
  (err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    // 2. Upload the file.
    axios(
      {
        method: "PUT",
        url: res.headers.location,
        headers: { "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}` },
        body: fs.readFileSync(file)
      },
      (err, res, body) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(body);
      }
    )
  }
)
}

resumableUpload()

module.exports = {
  listFiles
}