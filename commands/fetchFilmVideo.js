const fs = require("fs");

// retrieve video
module.exports = {
    page: "/film/fetchvideo",
    method: "GET",
    execute: (req, res) => {
        // sets response to jpeg
        res.set("Content-Type", "video/mp4");

        // checks if file exists, for the json
        let id = req.query.id;
        let fileExists = fs.existsSync(`./assets/metadata/${id}.json`);

        // sends error should it not exist
        if(!fileExists){
            res.status(404).send("");
        }

        // header range
        const range = req.headers.range;
        console.log(range)
        
        // retrieves video
        const pathToVideo = `./assets/videos/${id}.mp4`;
        const videoSize = fs.statSync(pathToVideo).size;
        console.log(videoSize)

        // sends a thumbnail back
        res.send(fs.readFileSync(pathToVideo));
    }
};
