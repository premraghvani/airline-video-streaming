// validates a person
const {readDb, writeDb} = require("./database");

// validation func
async function validate(token){
    let passwordList = await readDb("main","passwordsTokens");
    let finalBody = {
        approval: false,
        level:"",
        token:"",
        expiry:0
    }

    // input validation
    if(!token){
        return finalBody;
    }

    if(!passwordList){
        return finalBody;
    }

    // checks what exists and is valid
    const d = new Date();
    const timenow = Math.round(d.getTime() / 1000)
    let passListsFiltered = [];
    for(var i = 0; i < passwordList.tokens.length; i++){
        let q = passwordList.tokens[i];
        if(q.expiry > timenow){
            passListsFiltered.push(q);
        }
    }
    passwordList.tokens = passListsFiltered
    await writeDb("main","passwordsTokens",passwordList)

    // searches for the tokens
    for(var i = 0; i < passwordList.tokens.length; i++){
        if(passwordList.tokens[i].token == token){
            finalBody = passwordList.tokens[i];
            finalBody.approval = true;
        }
    }

    return finalBody;
}

module.exports = {validate}