const {readDb, writeDb} = require("../commonFunctions/database");
const {validate} = require("../commonFunctions/validation")

// canin crew to send a message
module.exports = {
    page: "/message/send",
    method: "POST",
    execute: async(req, res) => {
        // finds data
        let rawBody = req.body;
        let validateUser = await validate(req.cookies.token);
        if(validateUser.approval === false){
            res.status(403).send(JSON.stringify({error:"Must be authenticated"}))
            return;
        }

        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());

        if(!body.message){
            res.status(400).send(JSON.stringify({error:"Please write a message"}));
            return;
        }

        // checks review against regex
        const reviewRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/;
        if(reviewRegex.test(body.review) === false){
            res.status(400).send(JSON.stringify({error:"Message must contain alphanumeric characters, a space, or the special characters: .,-!?'\"() only"}));
            return;
        }

        // adds message
        const d = new Date();
        let messageList = await readDb("main","messages")
        let messageBody = {
            timestamp: Math.floor(d.getTime() / 1000),
            message:body.message
        }
        messageList.push(messageBody)

        // adds to file
        await writeDb("main","messages",messageList)

        // confirms
        res.status(200).send(JSON.stringify({message:"Success!"}));
        return;
    }
};