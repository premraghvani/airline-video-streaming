// common function to read a database, in the current case it is a JSON file but to be changed
const fs = require("fs")

async function readDatabase(tableName,key) {
    
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

module.exports = {readDatabase}