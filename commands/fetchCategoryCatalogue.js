const { readDb } = require("../commonFunctions/database");

// retrieves a list of all film categories
module.exports = {
  page: "/film/category/fetch",
  method: "GET",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // retrieves
    let films = await readDb("main", "index");

    // error case
    if (films === false) {
      res
        .status(500)
        .send({ message: "Couldn't find any films - server error" });
      return;
    }

    // filters for films
    let filmsInCategories = {};
    for (var i = 0; i < films.length; i++) {
      let cat = films[i].genre.toLowerCase();
      if (!filmsInCategories[cat]) {
        filmsInCategories[cat] = [];
      }
      filmsInCategories[cat].push(films[i]);
    }
    let categories = Object.keys(filmsInCategories).sort();

    // returns data
    res.status(200).send({ categories });
    return;
  }
};