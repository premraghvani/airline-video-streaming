const {validate} = require("../commonFunctions/validation");

// verifies a token
module.exports = {
    page: "/authenticate/token",
    method: "POST",
    execute: async(req, res) => {
        res.set("Content-Type", "application/json");

        // token validation
        const token = req.cookies.token;

        if(!token){
            res.status(400).send({message:"No token found"});
            return;
        }

        const tokenRegex = /^[a-f0-9]{64}$/;
        if(tokenRegex.test(token) === false){
            res.status(400).send({message:"Invalid token"});
            return;
        }

        // finds and sends token info

        let validation = await validate(token);

        res.status(200).send(validation);
    }
};