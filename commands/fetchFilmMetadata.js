const { readDb } = require("../commonFunctions/database");

// retrieves metadata
module.exports = {
  page: "/film/individual/metadata",
  method: "GET",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // checks input, validates it
    let id = req.query.id;
    if (!id || /^[0-9]+$/.test(id) === false) {
      res.status(400).send({ message: "Invalid id" });
      return;
    }

    // retrieves data
    let data = await readDb("metadata", id);

    // response depending on if it exists
    if (data === false) {
      // does not exist - empty set response
      res.status(404).send({});
    } else {
      // sends data if it exists
      res.status(200).send(data);
    }
    return;
  }
};