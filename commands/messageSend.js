const {readDatabase} = require("../commonFunctions/databaseRead");
const {writeDatabase} = require("../commonFunctions/databaseWrite");
const {validate} = require("../commonFunctions/validation")

// canin crew to send a message
module.exports = {
    page: "/message/send",
    method: "POST",
    execute: async(req, res) => {
        // finds data
        let rawBody = req.body;
        let validateUser = await validate(req.cookies.token);
        if(validateUser.approval == false){
            res.status(403).send("Must be validated")
            return;
        }

        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());

        if(!body.message){
            res.status(400).send("Specify message");
            return;
        }

        // checks review against regex
        const reviewRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/;
        if(reviewRegex.test(body.review) == false){
            res.status(400).send("Message must contain alphanumeric characters, a space, or the special characters: .,-!?'\"() only");
            return;
        }

        // adds message
        const d = new Date();
        let messageList = await readDatabase("main","messages")
        let messageBody = {
            timestamp: Math.floor(d.getTime() / 1000),
            message:body.message
        }
        messageList.push(messageBody)

        // adds to file
        await writeDatabase("main","messages",messageList)

        // confirms
        res.status(200).send("Accepted");
        return;
    }
};