/***
 * Six Degrees of Spotify
 * This is run to collect data from the Spotify endpoint.
 * author: @rahrang
*/

// Import file server
const fs = require('fs');
// Import request package
const request = require('request');
// Import moment package
const moment = require('moment');

const helpers = require('./helpers.js');

const USA_PATH = '../track_data/usa'
const GLOBAL_PATH = '../track_data/global'

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com';
const SPOTIFY_USER = 'spotifycharts'
const USA_CHART = '37i9dQZEVXbLRQDuF5jeBp'; // US TOP 50
const GLOBAL_CHART = '37i9dQZEVXbMDoHDwVN2tF'; // Global TOP 50

const CLIENT_ID = '547c50263a834e1aa8facc89365eb672';
const CLIENT_SECRET = 'd6957ea6a316466e97f4ca8a7170be5f';



/*** Create the file name ***/
createDate = () => {
    const momentDate = moment().format('L').toString();
    const date = momentDate.split('/').join('_');
    return date;
}

const day = moment().format('dddd').toString();
const fileName = createDate();

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};


var makeRequest = (chartPath, chartID) => {
  request.post(authOptions, function(error, response, json) {
    if (!error && response.statusCode === 200) {

      // use the access token to access the Spotify Web API
      const token = json.access_token;
      const options = {
        url: `${SPOTIFY_API_BASE_URL}/v1/users/${SPOTIFY_USER}/playlists/${chartID}/tracks?fields=items(track(album(href,id,images,name),artists(href,id,name),id,name,popularity,uri))&limit=10&offset=0`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };

      // get data from the Spotify endpoint, store it in local files
      request.get(options, function(error, response, body) {
        bodyString = JSON.stringify(body);
        fs.appendFileSync(`${chartPath}/daily/data/${fileName}.json`, bodyString);
        helpers.addDate(`${chartPath}/daily/dates.json`, fileName);
        if (day === 'Monday') {
          fs.appendFileSync(`${chartPath}/weekly/data/${fileName}.json`, bodyString);
          helpers.addDate(`${chartPath}/weekly/dates.json`, fileName);
        }
      });
    }
  });
}

makeRequest(USA_PATH, USA_CHART);
makeRequest(GLOBAL_PATH, GLOBAL_CHART);
