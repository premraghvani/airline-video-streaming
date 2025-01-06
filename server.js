const config = require("./config.json");

// actually runs the server.
const { app } = require("./app.js");

app.listen(config.port);
console.log(`Services available - access on this device at http://localhost:${config.port} (crew: http://localhost:${config.port}/crew) - please ensure ports are configured correctly should you want to access on other internet devices.`)