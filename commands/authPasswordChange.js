const bcrypt = require("bcryptjs");
const {readDb, writeDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// changes a password if the person is an admin
module.exports = {
    page: "/authenticate/change",
    method: "POST",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // gets body
        let body;
        try {
            body = JSON.parse(req.body.toString())
        } catch(err){
            body = {}
        }

        // input validation
        let password = body.password;
        let mode = body.mode;
        if(!password){
            res.status(400).send({message:"Specify password"});
            return;
        }
        if(!mode || (mode != "admin" && mode != "crew")){
            res.status(400).send({message:"Specify mode"});
            return;
        }

        const passwordRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/;
        if(passwordRegex.test(password) === false){
            res.status(400).send({message:"Invalid password"});
            return;
        }

        // authentication
        let validateUser = await validate(req.cookies.token);
        if(validateUser.level != "admin"){
            res.status(403).send({message:"Must be authenticated as an admin"});
            return;
        }

        // retrieves current password list
        let passwordFile = await readDb("main","passwordsTokens");
        if(passwordFile === false){
            res.status(500).send({message:"Could not find passwords"})
            return;
        }

        // prevents the same password in both categories
        
        if(mode == "admin"){
            let currentCrewHash = passwordFile.crew
            if(bcrypt.compareSync(password,currentCrewHash) === true){
                res.status(400).send({message:"New admin password must not be the same as crew password"});
                return;
            }
        } else {
            let currentAdminHash = passwordFile.admin
            if(bcrypt.compareSync(password,currentAdminHash) === true){
                res.status(400).send({message:"New crew password must not be the same as admin password"});
                return;
            }
        }

        // encrypts password
        let salt = bcrypt.genSaltSync(12);
        let passwordHash = bcrypt.hashSync(password,salt);
        passwordFile[mode] = passwordHash;

        await writeDb("main","passwordsTokens",passwordFile)

        res.status(200).send({message:"Success!"});
        return;
    }
};
