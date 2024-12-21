const bcrypt = require("bcryptjs");
const {readDb, writeDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// changes a password if the person is an admin
module.exports = {
    page: "/authenticate/change",
    method: "POST",
    execute: async(req, res) => {
        // finds password
        let rawBody = req.body;
        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());

        // input validation
        let password = body.password;
        let mode = body.mode;
        if(!password){
            res.status(400).send(`{"error":"specify password"}`);
            return;
        }
        if(!mode || (mode != "admin" && mode != "crew")){
            res.status(400).send(`{"error":"specify mode (admin or crew)"}`);
            return;
        }

        const passwordRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/;
        if(passwordRegex.test(password) === false){
            res.status(400).send(`{"error":"invalid password"}`);
            return;
        }

        // authentication
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send(JSON.stringify({error:"Must be authenticated as an admin"}))
            return;
        }

        // encrypts password
        let salt = bcrypt.genSaltSync(12);
        let passwordHash = bcrypt.hashSync(password,salt);

        // commits changes
        let passwordFile = await readDb("main","passwordsTokens");
        if(passwordFile === false){
            res.status(500).send(JSON.stringify({error:"Could not find passwords"}))
            return;
        }

        passwordFile[mode] = passwordHash;

        await writeDb("main","passwordsTokens",passwordFile)

        res.status(200).set("Content-Type", "application/json").send({message:"Success!"});
        return;
    }
};
