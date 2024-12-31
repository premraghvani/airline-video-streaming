const bcrypt = require("bcryptjs");
const { readDb, writeDb } = require("../commonFunctions/database");

// authenticates a person using password, returns token if valid
module.exports = {
  page: "/authenticate",
  method: "POST",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // gets body
    let body;
    try {
      body = JSON.parse(req.body.toString());
    } catch (err) {
      body = {};
    }

    // finds password, input validation
    let password = body.password;
    if (!password) {
      res.status(400).send({ message: "Specify Password" });
      return;
    }

    const passwordRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,64}$/;
    if (passwordRegex.test(password) === false) {
      res.status(400).send({ message: "Invalid Password" });
      return;
    }

    // gets the final body for approvals
    let finalBody = {
      approval: false,
      level: "",
      token: "",
      expiry: 0,
    };

    // compares
    let passwordList = await readDb("main", "passwordsTokens");

    if (passwordList === false) {
      res.status(500).send({ message: "Unknown server error" });
      return;
    }

    if (bcrypt.compareSync(password, passwordList.crew)) {
      finalBody = await generateToken("crew");
    } else if (bcrypt.compareSync(password, passwordList.admin)) {
      finalBody = await generateToken("admin");
    }

    res.status(200).send(JSON.stringify(finalBody));
    return;
  },
};

// generates a token
async function generateToken(level) {
  const d = new Date();
  let expiry = Math.floor(d.getTime() / 1000) + 60 * 60; // expires after 60 minutes

  // creates 64 character hexadecimal string
  let token = "";
  for (var i = 0; i < 64; i++) {
    let num = Math.floor(Math.random() * 16);
    token += num.toString(16);
  }

  // compares to make sure it does not already exist
  let passwordList = await readDb("main", "passwordsTokens");
  for (var i = 0; i < passwordList.tokens.length; i++) {
    if (passwordList.tokens[i].token == token) {
      return await generateToken(); // recursive function - generates until a valid non-duplicate token exists
    }
  }

  // puts into password tokens
  passwordList.tokens.push({
    token,
    expiry,
    level,
  });
  await writeDb("main", "passwordsTokens", passwordList);

  // return case
  return {
    token,
    expiry,
    level,
    approval: true,
  }
}