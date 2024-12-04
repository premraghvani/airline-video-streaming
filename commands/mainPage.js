const fs = require("fs");

// simply serves the front html page, replacing elements with the film titles, and the flight details
module.exports = {
    page: "/",
    method: "GET",
    execute: (req, res) => {
        let body = fs.readFileSync("./static/main.html").toString();

        let flightDetails = require("../assets/flightData.json")

        for(key in flightDetails){
            body = body.replaceAll(`{{${key}}}`,flightDetails[key])
        }

        res.set("Content-Type", "text/html");
        res.send(body);
    }
};
