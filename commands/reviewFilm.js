const fs = require("fs");

// review a film - add it for approval
module.exports = {
    page: "/review/submit",
    method: "POST",
    execute: (req, res) => {
        // finds data
        let rawBody = req.body;
        if(!rawBody){rawBody = "{}"}
        let body = JSON.parse(rawBody.toString());

        if(!body.review || !body.movieId){
            res.status(400).send("Specify review content and movie ID");
            return;
        }

        // checks review against regex
        const reviewRegex = /^[A-Za-z0-9 \.,\-!?'"()]+$/;
        if(reviewRegex.test(body.review) == false){
            res.status(400).send("Review must contain alphanumeric characters, a space, or the special characters: .,-!?'\"() only");
            return;
        }

        // checks if move exists
        let fileExists = fs.existsSync(`./assets/reviews/${body.movieId}.json`)
        if(!fileExists){
            res.status(404).send("Movie does not exist");
            return;
        }

        // makes review
        const d = new Date();
        let flightInfo = require("../assets/flightData.json")
        let reviewBody = {
            timestamp: Math.floor(d.getTime() / 1000),
            flight:flightInfo.flightNum,
            review:body.review,
            approved:false
        }

        // adds to file
        let reviewFile = JSON.parse(fs.readFileSync(`./assets/reviews/${body.movieId}.json`).toString());
        reviewFile.push(reviewBody);
        fs.writeFileSync(`./assets/reviews/${body.movieId}.json`,JSON.stringify(reviewFile));

        // confirms
        res.status(202).send("Accepted for Moderation");
    }
};