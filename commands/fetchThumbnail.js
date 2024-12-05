const fs = require("fs");

// checks if the connection is online
module.exports = {
    page: "/fetchthumbnail",
    method: "GET",
    execute: (req, res) => {
        // sets response to jpeg
        res.set("Content-Type", "image/jpeg");

        // checks if file exists
        let id = req.query.id;
        let fileExists = fs.existsSync(`./assets/thumbnails/${id}.jpg`);

        // sends a thumbnail back
        let content;        
        if(fileExists){
            content = fs.readFileSync(`./assets/thumbnails/${id}.jpg`);
        } else {
            content = fs.readFileSync("./assets/thumbnails/0.jpg")
        }

        res.send(content);
    }
};
