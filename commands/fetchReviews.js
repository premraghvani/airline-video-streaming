const fs = require("fs");

// retrieves reviews
module.exports = {
    page: "/review/fetch",
    method: "GET",
    execute: (req, res) => {
        // sets response to json
        res.set("Content-Type", "application/json");

        // checks if file exists
        let id = req.query.id;
        let fileExists = fs.existsSync(`./assets/reviews/${id}.json`);

        if(fileExists){
            // filters out non-allowed
            let rawData = JSON.parse(fs.readFileSync(`./assets/reviews/${id}.json`).toString());
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
        } else {
            res.status(404);
            res.send({})
        }
    }
};
