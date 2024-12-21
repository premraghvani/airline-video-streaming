const bcrypt = require("bcryptjs");
const {readDb, writeDb} = require("../commonFunctions/database");

// authenticates a person using password, returns token if valid
module.exports = {
    page: "/authenticate",
    method: "POST",
    execute: async(req, res) => {
        // finds password
        let body;
        try {
            body = JSON.parse(req.body.toString())
        } catch(err){
            body = {}
        }
        
        let password = body.password;
        if(!password){
            res.status(400).send(`{"error":"specify password"}`);
            return;
        }

        const passwordRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/;
        if(passwordRegex.test(password) === false){
            res.status(400).send(`{"error":"invalid password"}`);
            return;
        }

        let finalBody = {
            approval: false,
            level:"",
            token:"",
            expiry:0
        }

        // compares
        let passwordList = await readDb("main","passwordsTokens")

        if(passwordList === false){
            res.set(500).send("Unknown error - apologies");
            return;
        }

        if(bcrypt.compareSync(password,passwordList.crew)){
            finalBody = await generateToken("crew");
        } else if(bcrypt.compareSync(password,passwordList.admin)){
            finalBody = await generateToken("admin");
        }

        res.status(200).set("Content-Type", "application/json").send(JSON.stringify(finalBody));
        return;
    }
};

// generates a token
async function generateToken(level){
    const d = new Date();
    let expiry = Math.floor(d.getTime() / 1000) + 60*60 // expires after 60 minutes
    
    // creates 64 character hexadecimal string
    let token = "";
    for(var i = 0; i < 64; i++){
        let num = Math.floor(Math.random()*16);
        token += num.toString(16);
    }

    // compares to make sure it does not already exist
    let passwordList = await readDb("main","passwordsTokens")
    for(var i = 0; i < passwordList.tokens.length; i++){
        if(passwordList.tokens[i].token == token){
            return await generateToken() // recursive function - generates until a valid non-duplicate token exists
        }
    }

    // removes expired keys (because we are nice like that)
    let okayTokens = [];
    for(var i = 0; i < passwordList.tokens.length; i++){
        let now = Math.floor(d.getTime() / 1000);
        if(passwordList.tokens[i].expiry < now){
            okayTokens.push(passwordList[i])
        }
    }
    passwordList.tokens = okayTokens.splice();

    // puts into password tokens
    passwordList.tokens.push({
        token,
        expiry,
        level
    });
    await writeDb("main","passwordsTokens",passwordList)

    // return case
    return{
        token,
        expiry,
        level,
        approval:true
    }
}