const { readDb, writeDb } = require("../commonFunctions/database");
const { v4: uuidv4 } = require("uuid");

// review a film - add it for approval
module.exports = {
  page: "/review/send",
  method: "POST",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // finds data
    let body;
    try {
      body = JSON.parse(req.body.toString());
    } catch (err) {
      body = {};
    }

    // input validation
    if (!body.review || !body.movieId) {
      res.status(400).send({ message: "Specify review content and movie ID" });
      return;
    }

    // checks review against regex
    const reviewRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,256}$/;
    if (reviewRegex.test(body.review) === false) {
      res
        .status(400)
        .send({
          message:
            "Review must contain alphanumeric characters, a space, or the special characters: .,-!?'\"() only",
        });
      return;
    }

    // checks if movie exists
    let reviews = await readDb("reviews", body.movieId);
    if (reviews === false) {
      res.status(404).send({ message: "Movie does not exist" });
      return;
    }

    // makes review
    const d = new Date();
    let flightInfo = await readDb("main", "flightData");
    let reviewBody = {
      timestamp: Math.floor(d.getTime() / 1000),
      flight: flightInfo.flightNum,
      review: body.review,
      approved: false,
      id: uuidv4(),
    };

    // adds to file
    reviews.push(reviewBody);
    await writeDb("reviews", body.movieId, reviews);

    // confirms
    res.status(202).send({ message: "Accepted for Moderation" });
    return;
  }
};