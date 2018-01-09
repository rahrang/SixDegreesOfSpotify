/***
 * Six Degrees of Spotify
 * This is run to create a file with a mapping between the date & rank of a track.
 * author: @rahrang
*/

// Node Modules
const fs = require('fs');

// NPM Modules
const _ = require('lodash');

// // Local helper file
const helpers = require('./helpers.js');

/*** CONSTANTS ***/
const GLOBAL_PATH = '../track_data/global';
const USA_PATH = '../track_data/usa';

const global_weekly_dates = require(`${GLOBAL_PATH}/weekly/dates.json`);
const global_weekly_ranks_path = `${GLOBAL_PATH}/weekly/ranks`;

const usa_weekly_dates = require(`${USA_PATH}/weekly/dates.json`);
const usa_weekly_ranks_path = `${USA_PATH}/weekly/ranks`;

var collectRanks = (chart, view) => {

    const PATH = `../track_data/${chart}/${view}`;
    let dateArray = require(`${PATH}/dates.json`);
    let ranksPath = `${PATH}/ranks`;

    if (_.isEmpty(dateArray)) {
        console.log(`${view} ${chart} does not have any dates`);
        return false;
    }

    for (let i = 0; i < dateArray.length; i++) {
        
        let date = dateArray[i];
        let dateFile = fetchFile(`${PATH}/data/${date}.json`);
        
        if (_.isEmpty(dateFile)) {
            console.log(`${date}.json does not exist`);
            break
        }

        let dateData = dateFile.items;

        for (let j = 0; j < dateData.length; j++) {

            let trackID = dateData[j].track.id;
            let file = `${ranksPath}/${trackID}.json`;
            let trackFile = fetchFile(file);

            if (!fileContainsDate(trackFile, date)) {
            
                let data = {};
                data['date'] = date;
                data['rank'] = (-(j + 1));
                trackFile.push(data);
                saveFile(file, trackFile);
                console.log(`${trackID} has been saved for ${date}`);
                
            } else {
                console.log(`${trackID} already contains a rank for ${date}`);
            }
        }
    }
}

var fileContainsDate = (file, date) =>  {
    for (let k = 0; k < file.length; k++) {
        if (_.isEqual(file[k].date, date)) {
            return true;
        }
    }
    return false;
}

var fetchFile = (file) => {
    try {
        let fileString = fs.readFileSync(file);
        return JSON.parse(fileString);
    } catch (e) {
        return [];
    }
}

var saveFile = (file, fileJSON) => {
    fs.writeFileSync(file, JSON.stringify(fileJSON));
}

collectRanks('usa', 'weekly');
collectRanks('global', 'weekly');

module.exports = {
    collectRanks
}