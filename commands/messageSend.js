const fs = require("fs");

// canin crew to send a message
module.exports = {
    page: "/message/send",
    method: "POST",
    execute: (req, res) => {
        // finds data
        let rawBody = req.body;
        console.log(req.cookies.token)
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
        let messageList = require("../assets/messages.json")
        let messageBody = {
            timestamp: Math.floor(d.getTime() / 1000),
            message:body.message
        }
        messageList.push(messageBody)

        // adds to file
        fs.writeFileSync(`./assets/messages.json`,JSON.stringify(messageList));

        // confirms
        res.status(200).send("Accepted");
    }
};