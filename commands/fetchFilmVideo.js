const fs = require("fs");

// retrieve video
module.exports = {
  page: "/film/individual/video",
  method: "GET",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    const id = req.query.id;
    const videoPath = `./assets/videos/${id}.mp4`;

    // checks if id is valid
    if (!id || /^[0-9]+$/.test(id) === false) {
      res.status(400).send({ message: "Invalid ID" });
      return;
    }

    // check if video file exist
    if (!fs.existsSync(videoPath)) {
      res.status(404).send({ message: "Not found" });
      return;
    }

    // get the range from headers
    const range = req.headers.range;
    if (!range) {
      res.status(400).send({ message: "Range headers error" });
      return;
    }

    // retrieve video file size
    const videoSize = fs.statSync(videoPath).size;

    // parse range
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + 2 * 10 ** 6 - 1, videoSize - 1); // default to 500KB chunk size, iff end not specified

    // validate range
    if (start >= videoSize || end >= videoSize || start > end) {
      res
        .status(416)
        .send({
          message: `Not satisfiable, min range: 0, max range: ${videoSize - 1}`,
        });
      return;
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
      res.set("Content-Type", "application/json");
      res.status(500).send({ message: "Error streaming video - server error" });
      return;
    });

    // terminates safely
    res.on("close", () => {
      videoStream.destroy();
    });
    return;
  }
};