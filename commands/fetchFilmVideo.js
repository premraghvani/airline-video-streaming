const fs = require("fs");

// inspiratoin: https://blog.logrocket.com/build-video-streaming-server-node/

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

        // header range, needed to send the correct next parts
        const range = req.headers.range;
        if(!range){
            res.status(400).send("Error: requires range headers")
        }
        
        // retrieves video
        const pathToVideo = `./assets/videos/${id}.mp4`;
        const videoSize = fs.statSync(pathToVideo).size;

        // chunks
        const chunkSize = 0.5*10**6 // 500 KB chunk size
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, videoSize - 1);

        // breakpoint
        if(start==end){return;}

        // response headers
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end-start,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);

        // gets the 2MB max chunk and sends it
        const videoStream = fs.createReadStream(pathToVideo, { start, end });
        videoStream.pipe(res);
    }
};
