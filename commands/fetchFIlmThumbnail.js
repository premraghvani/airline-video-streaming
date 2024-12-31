const fs = require("fs");

// retrieves thumbnail
module.exports = {
  page: "/film/individual/thumbnail",
  method: "GET",
  execute: async (req, res) => {
    // sets response to jpeg
    res.set("Content-Type", "image/jpeg");

    // checks if file exists
    let id = req.query.id;
    let fileExists = fs.existsSync(`./assets/thumbnails/${id}.jpg`);

    // sends a thumbnail back
    let content;
    if (fileExists) {
      res.status(200);
      content = fs.readFileSync(`./assets/thumbnails/${id}.jpg`);

      // returns a default thumbnail as a failure
    } else if (fs.existsSync(`./assets/thumbnails/0.jpg`)) {
      res.status(404);
      if (!id || /^[0-9]+$/.test(id) === false) {
        res.status(400);
      }
      content = fs.readFileSync("./assets/thumbnails/0.jpg");

      // or nothing on failure.
    } else {
      res.status(500);
      content = "";
    }

    res.send(content);
    return;
  }
};