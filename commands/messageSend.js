const { readDb, writeDb } = require("../commonFunctions/database");
const { validate } = require("../commonFunctions/validation");

// canin crew to send a message
module.exports = {
  page: "/message/send",
  method: "POST",
  execute: async (req, res) => {
    res.set("Content-Type", "application/json");

    // finds data
    let validateUser = await validate(req.cookies.token);
    if (validateUser.approval === false) {
      res.status(403).send({ message: "Must be authenticated" });
      return;
    }

    let body;
    try {
      body = JSON.parse(req.body.toString());
    } catch (err) {
      body = {};
    }

    if (!body.message) {
      res.status(400).send({ message: "Please write a message" });
      return;
    }

    // checks review against regex
    const reviewRegex = /^[A-Za-z0-9 \.,\-!?'"()]{1,512}$/;
    if (reviewRegex.test(body.message) === false) {
      res
        .status(400)
        .send({
          message:
            "Message must contain alphanumeric characters, a space, or the special characters: .,-!?'\"() only - up to 512 characters",
        });
      return;
    }

    // adds message
    const d = new Date();
    let messageList = await readDb("main", "messages");
    let messageBody = {
      timestamp: Math.floor(d.getTime() / 1000),
      message: body.message,
    };
    messageList.push(messageBody);

    // adds to file
    await writeDb("main", "messages", messageList);

    // confirms
    res.status(200).send({ message: "Success!" });
    return;
  }
};