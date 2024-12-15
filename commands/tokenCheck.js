const fs = require("fs");

// verifies a token
module.exports = {
    page: "/authenticate/token",
    method: "POST",
    execute: (req, res) => {
        // finds token
        const rawBody = req.body;
        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());
        let cookies = cookieExtract(body.cookies);
        let token = cookies.token;

        if(!cookies){
            res.status(400).send(`{"error":"specify token"}`);
            return;
        }

        let finalBody = {
            approval: false,
            level:"",
            token:"",
            expiry:0
        }

        // finds
        let passwordList = JSON.parse(fs.readFileSync("./assets/passwordsTokens.json").toString())
        for(var i = 0; i < passwordList.tokens.length; i++){
            if(passwordList.tokens[i].token == token){
                finalBody = passwordList.tokens[i];
                finalBody.approval = true;
            }
        }

        res.set("Content-Type", "application/json").send(JSON.stringify(finalBody));
    }
};

// extracts cookie string
function cookieExtract(cookie){
    if(!cookie){
        return {};
    } else {
        let cookieList = cookie.split("; ");
        let cookieSet = {};
        for(var i = 0; i < cookieList.length; i++){
            let q = cookieList[i].split("=");
            cookieSet[q[0]] = q[1]
        }
        return cookieSet
    }
}