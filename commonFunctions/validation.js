// validates a person
const {readDb} = require("./database");

// validation func
async function validate(token){
    let passwordList = await readDb("main","passwordsTokens");
    let finalBody = {
        approval: false,
        level:"",
        token:"",
        expiry:0
    }

    if(!token){
        return finalBody;
    }

    if(!passwordList){
        return finalBody;
    }

    for(var i = 0; i < passwordList.tokens.length; i++){
        if(passwordList.tokens[i].token == token){
            finalBody = passwordList.tokens[i];
            finalBody.approval = true;
        }
    }

    return finalBody;
}

module.exports = {validate}