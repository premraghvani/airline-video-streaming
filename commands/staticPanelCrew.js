const fs = require("fs");

// simply serves the crew's html page
module.exports = {
    page: "/crew",
    method: "GET",
    execute: async(req, res) => {
        let body = fs.readFileSync("./static/crew.html").toString();

        // gets flight details, and puts into body
        let flightDetails = require("../assets/flightData.json")
        for(key in flightDetails){
            body = body.replaceAll(`{{${key}}}`,flightDetails[key])
        }

        res.set("Content-Type", "text/html").send(body);
        return;
    }
};
