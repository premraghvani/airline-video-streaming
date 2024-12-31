const { readDb } = require("../commonFunctions/database");

// retrieves reviews
module.exports = {
  page: "/review/fetch",
  method: "GET",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // checks input
    let id = req.query.id;
    if (!id || /^[0-9]+$/.test(id) === false) {
      res.status(400).send({ message: "Invalid id" });
      return;
    }

    // fetches reviews
    let rawData = await readDb("reviews", req.query.id);

    // validates there exists reviews, if there does, filters them
    if (rawData === false) {
      res.status(404).send({ message: "Movie does not exist" });
    } else {
      // filters out non-approved
      let filteredData = [];
      for (var i = 0; i < rawData.length; i++) {
        let review = rawData[i];
        if (review.approved) {
          filteredData.push(review);
        }
      }
      // sends data if it exists
      res.status(200).send(filteredData);
    }
    return;
  }
};