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

        let validation = await validate(token)

        res.status(200).set("Content-Type", "application/json").send(JSON.stringify(validation));
    }
};