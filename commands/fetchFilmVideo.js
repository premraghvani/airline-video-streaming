const fs = require("fs");

// inspiratoin: https://blog.logrocket.com/build-video-streaming-server-node/

// http statuses relevant (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) are 206 for partial content, 404 not found, 400 no range headers (so bad request), 416 (range not satisfiable), 500 (server messed somet else up)

// retrieve video
module.exports = {
    page: "/film/individual/video",
    method: "GET",
    execute: async(req, res) => {
        const id = req.query.id;
        const videoPath = `./assets/videos/${id}.mp4`;

        // check if video file exist
        if (!fs.existsSync(videoPath)) {
            return res.status(404).send("Not found");
        }

        // get the range from headers
        const range = req.headers.range;
        if (!range) {
            return res.status(400).send("Requires range header");
        }

        // retrieve video file size
        const videoSize = fs.statSync(videoPath).size;

        // parse range
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 0.5 * 10 ** 6 - 1, videoSize - 1); // default to 500KB chunk size, iff end not specified

        // validate range
        if (start >= videoSize || end >= videoSize || start > end) {
            return res.status(416).send(`not satisfiable, min range: 0, max range: ${videoSize-1}`);
        }

        // prepare headers
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);

        // create video stream and handle events
        const videoStream = fs.createReadStream(videoPath, { start, end });

        videoStream.on("open", () => {
            videoStream.pipe(res);
        });

        videoStream.on("error", (err) => {
            res.status(500).send("Error streaming video - sorry, we messed up");
        });

        // terminates safely
        res.on("close", () => {
            videoStream.destroy();
        });
        return;
    },
};
