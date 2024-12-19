const {readDatabase} = require("../commonFunctions/databaseRead");
const {writeDatabase} = require("../commonFunctions/databaseWrite");

// review a film - add it for approval
module.exports = {
    page: "/review/send",
    method: "POST",
    execute: async(req, res) => {
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
        let reviews = await readDatabase("reviews",body.movieId); 
        if(reviews == false){
            res.status(404).send("Movie does not exist");
            return;
        }

        // makes review
        const d = new Date();
        let flightInfo = await readDatabase("main","flightData");
        let reviewBody = {
            timestamp: Math.floor(d.getTime() / 1000),
            flight:flightInfo.flightNum,
            review:body.review,
            approved:false
        }

        // adds to file
        reviews.push(reviewBody);
        await writeDatabase("reviews",body.movieId,reviews)

        // confirms
        res.status(202).send("Accepted for Moderation");
        return;
    }
};