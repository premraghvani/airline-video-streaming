const fs = require("fs");
const bcrypt = require("bcryptjs");

// authenticates a person
module.exports = {
    page: "/authenticate",
    method: "POST",
    execute: (req, res) => {
        // finds password
        const rawBody = req.body;
        let submission = queryStringToJson(rawBody.toString("utf-8"))
        let password = submission.password;
        if(!password){
            res.status(400).send("Must specify password")
        }

        let finalBody = {
            approval: false,
            level:"",
            token:"",
            expiry:0
        }

        // compares
        let passwordList = require("../assets/passwordsTokens.json")
        if(bcrypt.compareSync(password,passwordList.crew)){

        } else if(bcrypt.compareSync(password,passwordList.admin)){

        }

        // sends body
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify(finalBody));
    }
};

//webform to json
function queryStringToJson(queryString) {
    const pairs = queryString.split('&');
    const json = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        json[key] = isNaN(value) ? decodeURIComponent(value) : Number(value);
    });

    return json;
}

// generates a token
function generateToken(level){
    const d = new Date();
    let expiry = Math.floor(d.getTime() / 1000) + 60*60 // expires after 60 minutes
    
    // creates 64 character hexadecimal string
    let token = "";
    for(var i = 0; i < 64; i++){
        let num = Math.floor(Math.random()*16);
        token += num.toString(16);
    }

    // compares to make sure it does not already exist
    let passwordList = require("../assets/passwordsTokens.json")
    for(var i = 0; i < passwordList.tokens.length; i++){
        if(passwordList[i].token == token){
            return generateToken() // recursive function - generates until a valid non-duplicate token exists
        }
    }

    // puts into password tokens
    passwordList.tokens.push({
        token,
        expiry,
        level
    });
    fs.writeFileSync("../assets/passwordTokens.json",JSON.stringify(passwordList));

    // return case
    return{
        token,
        expiry,
        level
    }
}