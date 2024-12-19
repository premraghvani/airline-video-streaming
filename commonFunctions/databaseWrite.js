// common function to read a database, in the current case it is a JSON file but to be changed
const fs = require("fs")

async function writeDatabase(tableName,key,body) {
    
    // makes a json path
    let path = ""
    if(tableName == "main"){
        path = `./assets/${key}.json`
    } else {
        path = `./assets/${tableName}/${key}.json`
    }

    // writes to it
    fs.writeFileSync(path,JSON.stringify(body))
}

module.exports = {writeDatabase}