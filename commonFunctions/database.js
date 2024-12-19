// common function to read and write in a database, in the current case it is a JSON file but to be changed
const fs = require("fs")

// to read
async function readDb(tableName,key) {
    // gets a json path
    let path = ""
    if(tableName == "main"){
        path = `./assets/${key}.json`
    } else {
        path = `./assets/${tableName}/${key}.json`
    }

    // checks if resource exists
    let fileExists = fs.existsSync(path);
    
    if(fileExists){
        return JSON.parse(fs.readFileSync(path).toString());
    } else {
        return false
    }
}

// to write
async function writeDb(tableName,key,body) {
    // makes a json path
    let path = ""
    if(tableName == "main"){
        path = `./assets/${key}.json`
    } else {
        path = `./assets/${tableName}/${key}.json`
    }

    // writes to it
    fs.writeFileSync(path,JSON.stringify(body))

    return true;
}

module.exports = {readDb, writeDb}