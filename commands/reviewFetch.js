const {readDb} = require("../commonFunctions/database");

// retrieves reviews
module.exports = {
    page: "/review/fetch",
    method: "GET",
    execute: async(req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // fetches reviews
        let rawData = await readDb("reviews",req.query.id);
        
        if(rawData == false){
            res.status(404);
            res.send({});
        } else {
            // filters out non-approved
            let filteredData = [];
            for(var i = 0; i < rawData.length; i++){
                let review = rawData[i];
                if(review.approved){
                    filteredData.push(review)
                }
            }
            // sends data if it exists
            res.status(200);
            res.send(filteredData);
        }
        return;
    }
};
