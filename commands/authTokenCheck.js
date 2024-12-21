const {validate} = require("../commonFunctions/validation");

// verifies a token
module.exports = {
    page: "/authenticate/token",
    method: "POST",
    execute: async(req, res) => {
        // finds token
        const token = req.cookies.token;

        if(!token){
            res.status(400).send(`{"error":"specify token"}`);
            return;
        }

        const tokenRegex = /^[a-f0-9]{64}$/;
        if(tokenRegex.test(token) === false){
            res.status(400).send(`{"error":"specify valid token"}`);
            return;
        }

        let validation = await validate(token)

        res.status(200).set("Content-Type", "application/json").send(JSON.stringify(validation));
    }
};