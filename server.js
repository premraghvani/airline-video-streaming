const config = require("./config.json");

// actually runs the server.
const { app } = require("./app.js");

app.listen(config.port);