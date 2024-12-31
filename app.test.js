const request = require("supertest");
const {app} = require("./app");

let token;

/* /!\ The order of these tests are not in the same order as the API docs, either because:
    - I did them in an odd order because that's how my brain worked
    - the ordering is deliberate as a success of one API will feed into another API
*/

// retrieves a valid token (if this test fails, the expectation is that 403s will be recieved instead of 200 for many items). These tests assume the original 3 films exist in the database.
// default password for admins is "goodbye"
const password = "goodbye";

beforeAll(async () => {
  const response = await request(app)
    .post("/authenticate")
    .send({ password });

  token = response.body.token;
});

describe("API Tests", () => {
    // /message/send POST
  describe("/message/send POST", () => {
    it("should send a message when authenticated", async () => {
      const response = await request(app)
        .post("/message/send")
        .set("Cookie", `token=${token}`)
        .send({ message: "Test message" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message", "Success!");
    });

    it("should return 403 for missing token", async () => {
      const response = await request(app)
        .post("/message/send")
        .send({ message: "Test message" });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for empty input", async () => {
      const response = await request(app)
        .post("/message/send")
        .set("Cookie", `token=${token}`)
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid input", async () => {
        const response = await request(app)
          .post("/message/send")
          .set("Cookie", `token=${token}`)
          .send({message:"$%$hello"});
  
        expect(response.statusCode).toBe(400);
      });
  });

  // /message/fetch GET
  describe("/message/fetch GET", () => {
    it("should return recent messages", async () => {
      const response = await request(app).get("/message/fetch");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((msg) => {
        expect(msg).toHaveProperty("message");
        expect(msg).toHaveProperty("timestamp");
      });
    });
  });

  // /film/category/fetch GET
  describe("/film/category/fetch GET", () => {
    it("should fetch all categories names", async () => {
      const response = await request(app).get("/film/category/fetch");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("categories");
      expect(Array.isArray(response.body.categories)).toBe(true);
    });
  });

  // /film/categoryfilter/fetch GET
  describe("/film/categoryfilter/fetch GET", () => {
    it("should fetch movies by category", async () => {
      const response = await request(app)
        .get("/film/categoryfilter/fetch?category=action");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((movie) => {
        expect(movie).toHaveProperty("id");
        expect(movie).toHaveProperty("title");
        expect(movie).toHaveProperty("genre");
        expect(movie).toHaveProperty("year");
      });
    });

    it("should return 404 for category which does not exist", async () => {
      const response = await request(app)
        .get("/film/categoryfilter/fetch?category=foo");
      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for missing category", async () => {
      const response = await request(app)
        .get("/film/categoryfilter/fetch");
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid category name", async () => {
        const response = await request(app)
          .get("/film/categoryfilter/fetch?category=123");
        expect(response.statusCode).toBe(400);
      });
  });

  // /film/individual/metadata GET
  describe("/film/individual/metadata GET", () => {
    it("should fetch metadata for a specific movie", async () => {
      const response = await request(app).get("/film/individual/metadata?id=1");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("description");
      expect(response.body).toHaveProperty("cast");
      expect(response.body).toHaveProperty("director");
    });

    it("should return 400 for missing movie id", async () => {
      const response = await request(app).get("/film/individual/metadata");
      expect(response.statusCode).toBe(400);
    });

    it("should return 404 for nonexistant movie", async () => {
      const response = await request(app).get("/film/individual/metadata?id=999");
      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for movie id in incorrect format", async () => {
        const response = await request(app).get("/film/individual/metadata?id=foo");
        expect(response.statusCode).toBe(400);
      });
  });

  // /film/individual/thumbnail GET
  describe("/film/individual/thumbnail GET", () => {
    it("should fetch movie thumbnail", async () => {
      const response = await request(app).get("/film/individual/thumbnail?id=1");
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
    });

    it("should return 404 for nonexistant movie", async () => {
      const response = await request(app).get("/film/individual/thumbnail?id=999");
      expect(response.statusCode).toBe(404);
    });
  });

  // /film/individual/video GET
  describe("/film/individual/video GET", () => {
    it("should fetch movie video content", async () => {
      const response = await request(app)
        .get("/film/individual/video?id=1")
        .set("Range", "bytes=0-2000000");
      expect(response.statusCode).toBe(206);
      expect(response.headers["content-type"]).toBe("video/mp4");
    });

    it("should return 404 for nonexistant movie", async () => {
      const response = await request(app).get("/film/individual/video?id=999");
      expect(response.statusCode).toBe(404);
    });

    it("should return 416 for invalid range headers", async () => {
      const response = await request(app)
        .get("/film/individual/video?id=1")
        .set("Range", "bytes=9999999-10000000");
      expect(response.statusCode).toBe(416);
    });

    it("should return 400 for missing range headers", async () => {
        const response = await request(app)
          .get("/film/individual/video?id=1")
        expect(response.statusCode).toBe(400);
      });
  });

  // /authenticate POST
  describe("/authenticate POST", () => {
    it("should return a valid token for correct password", async () => {
      const response = await request(app)
        .post("/authenticate")
        .send({ password: "goodbye" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("expiry");
      expect(response.body).toHaveProperty("level");
      expect(response.body.approval).toBe(true);
    });

    it("should return a valid token for correct password", async () => {
        const response = await request(app)
          .post("/authenticate")
          .send({ password: "goodbye" });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("expiry");
        expect(response.body).toHaveProperty("level");
      });

    it("should return 400 for missing password", async () => {
      const response = await request(app).post("/authenticate").send();
      expect(response.statusCode).toBe(400);
    });

    it("should return with information for an incorrect password, which is of correct format", async () => {
        const response = await request(app)
          .post("/authenticate")
          .send({ password: "goodbyeforever" });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("expiry");
        expect(response.body).toHaveProperty("level");
        expect(response.body.approval).toBe(false);
        expect(response.body.token).toBe("");
      });
  });

  // /flight GET
  describe("/flight GET", () => {
    it("should return flight data", async () => {
      const response = await request(app).get("/flight");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("origin");
      expect(response.body).toHaveProperty("destination");
      expect(response.body).toHaveProperty("originCode");
      expect(response.body).toHaveProperty("destinationCode");
      expect(response.body).toHaveProperty("flightNum");
    });
  });

  // /flight/data POST
  describe("/flight/data POST", () => {
    it("should update flight data - all data changes", async () => {
      const response = await request(app)
        .post("/flight/data")
        .set("Cookie", `token=${token}`)
        .send({
          origin: "Manchester",
          destination: "Dubai",
          originCode: "MAN",
          destinationCode: "DXB",
          flightNum: "EK 018"
        });
      expect(response.statusCode).toBe(200);
    });

    it("should update flight data - some data changes", async () => {
        const response = await request(app)
          .post("/flight/data")
          .set("Cookie", `token=${token}`)
          .send({
            flightNum: "EK 020"
          });
        expect(response.statusCode).toBe(200);
      });

    it("should return 403 for missing token", async () => {
      const response = await request(app)
        .post("/flight/data")
        .send({
            origin: "Manchester",
            destination: "Dubai",
            originCode: "MAN",
            destinationCode: "DXB",
            flightNum: "EK 018"
        });
      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid input: IATA codes", async () => {
      const response = await request(app)
        .post("/flight/data")
        .set("Cookie", `token=${token}`)
        .send({
            "originCode":"LeedsBradfordAirport"
        });
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid input: flight code", async () => {
        const response = await request(app)
          .post("/flight/data")
          .set("Cookie", `token=${token}`)
          .send({
              "flightNum":"EK 20!"
          });
        expect(response.statusCode).toBe(400);
      });
  });

  // /review/fetch GET
  describe("/review/fetch GET", () => {
    it("should fetch all approved reviews for a movie", async () => {
      const response = await request(app).get("/review/fetch?id=1");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((review) => {
        expect(review).toHaveProperty("timestamp");
        expect(review).toHaveProperty("flight");
        expect(review).toHaveProperty("review");
        expect(review).toHaveProperty("approved");
        expect(review).toHaveProperty("id");
      });
    });

    it("should return 404 if the movie does not exist", async () => {
      const response = await request(app).get("/review/fetch?id=999");
      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for missing movie id", async () => {
      const response = await request(app).get("/review/fetch");
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid movie id", async () => {
        const response = await request(app).get("/review/fetch?id=grr");
        expect(response.statusCode).toBe(400);
    });
  });

  // /review/send POST
  describe("/review/send POST", () => {
    it("should accept a review for moderation", async () => {
      const response = await request(app)
        .post("/review/send")
        .send({ review: "Amazing movie! Top Stuff!!", movieId: "1" });
      expect(response.statusCode).toBe(202);
    });

    it("should return 400 for invalid input (invalid review)", async () => {
      const response = await request(app).post("/review/send").send({ review: "%%%", movieId: "1" });
      expect(response.statusCode).toBe(400);
    });

    it("should return 404 if the movie does not exist", async () => {
      const response = await request(app)
        .post("/review/send")
        .send({ review: "Amazing movie! Top Stuff!!", movieId: "999" });
      expect(response.statusCode).toBe(404);
    });
  });

  // /review/fetch/all GET
  describe("/review/fetch/all GET", () => {
    it("should fetch all reviews (approved and unapproved) for a movie with admin token", async () => {
      const response = await request(app)
        .get("/review/fetch/all?id=1")
        .set("Cookie", `token=${token}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((review) => {
        expect(review).toHaveProperty("timestamp");
        expect(review).toHaveProperty("flight");
        expect(review).toHaveProperty("review");
        expect(review).toHaveProperty("approved");
        expect(review).toHaveProperty("id");
      });
    });

    it("should return 403 for missing or invalid token", async () => {
      const response = await request(app).get("/review/fetch/all?id=1");
      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for misssing movie id", async () => {
      const response = await request(app)
        .get("/review/fetch/all")
        .set("Cookie", `token=${token}`);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid movie id", async () => {
        const response = await request(app)
          .get("/review/fetch/all?id=grr")
          .set("Cookie", `token=${token}`);
        expect(response.statusCode).toBe(400);
      });
  });

  // /review/approvals POST
  describe("/review/approvals POST", () => {
    it("should approve and/or delete reviews with admin token (even if the IDs are invalid)", async () => {
      const response = await request(app)
        .post("/review/approvals")
        .set("Cookie", `token=${token}`)
        .send({
          movieId: "1",
          approvals: ["some-review-id"],
          deletions: ["different-review-id"]
        });
      expect(response.statusCode).toBe(200);
    });

    it("should accept even if only one field is given", async () => {
        const response = await request(app)
          .post("/review/approvals")
          .set("Cookie", `token=${token}`)
          .send({
            movieId: "1",
            approvals: ["some-review-id"]
          });
        expect(response.statusCode).toBe(200);
      });

    it("should return 400 for missing approvals and deletions", async () => {
      const response = await request(app)
        .post("/review/approvals")
        .set("Cookie", `token=${token}`)
        .send({ movieId: "1" });
      expect(response.statusCode).toBe(400);
    });

    it("should return 403 for missing or invalid token", async () => {
      const response = await request(app).post("/review/approvals").send({
        movieId: "1",
        approvals: ["some-review-id"],
      });
      expect(response.statusCode).toBe(403);
    });

    it("should return 404 for non existant movie id", async () => {
        const response = await request(app)
          .post("/review/approvals")
          .set("Cookie", `token=${token}`)
          .send({ movieId: "999", approvals:["some-review-id"] });
        expect(response.statusCode).toBe(404);
      });
  });

  // /film/individual/new/metadata POST
  let movieIdNew = 0;

  describe("/film/individual/new/metadata POST", () => {
    it("should create new film metadata with admin token", async () => {
      const response = await request(app)
        .post("/film/individual/new/metadata")
        .set("Cookie", `token=${token}`)
        .send({
          title: "New Movie",
          description: "This is a test movie.",
          year: 2024,
          genre: "action",
          cast: "Actor A, Actor B",
          director: "Director A"
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");
      movieIdNew = response.body.id;
    });

    it("should return 400 for missing input", async () => {
      const response = await request(app)
        .post("/film/individual/new/metadata")
        .set("Cookie", `token=${token}`)
        .send({});
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for partial input", async () => {
        const response = await request(app)
          .post("/film/individual/new/metadata")
          .set("Cookie", `token=${token}`)
          .send({title: "Hello World"});
        expect(response.statusCode).toBe(400);
      });

      it("should return 400 for at least 1 invalid input", async () => {
        const response = await request(app)
          .post("/film/individual/new/metadata")
          .set("Cookie", `token=${token}`)
          .send({
            title: "New Movie%&$",
            description: "This is a test movie.",
            year: 2024,
            genre: "action",
            cast: "Actor A, Actor B",
            director: "Director A"
          });
        expect(response.statusCode).toBe(400);
      });
  });

  // /film/individual/new/multimedia PUT
  describe("/film/individual/new/multimedia PUT", () => {
    it("should reject a video segment more than 2 MB big", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 0-2999999/3000000")
        .send(Buffer.alloc(3000000));
      expect(response.statusCode).toBe(400);
    });

    it("should reject a video segment with a mismatch between header and content length", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 0-1999999/3000000") // implies 2MB chunk to be sent
        .send(Buffer.alloc(1000000)); // 1MB chunk sent
      expect(response.statusCode).toBe(400);
    });

    it("should reject where a header is missing", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .send(Buffer.alloc(2000000));
      expect(response.statusCode).toBe(400);
    });

    it("should reject where an item is not mp4 or jpeg", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "application/json")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 0-1999999/3000000")
        .send(Buffer.alloc(2000000));
      expect(response.statusCode).toBe(400);
    });

    it("should accept the first 2MB chunk for everything being valid (assuming a 3MB video)", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 0-1999999/3000000")
        .send(Buffer.alloc(2000000));
      expect(response.statusCode).toBe(200);
    });

    it("should return 403 for invalid token", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=invalid`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 2000000-2999999/3000000")
        .send(Buffer.alloc(1000000));
      expect(response.statusCode).toBe(403);
    });

    it("should accept the last 1MB chunk for everything being valid (assuming a 3MB video)", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 2000000-2999999/3000000")
        .send(Buffer.alloc(1000000));
      expect(response.statusCode).toBe(200);
    });

    it("should reject any new chunks of data", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", movieIdNew)
        .set("Content-Range", "bytes 2000000-2999999/3000000")
        .send(Buffer.alloc(1000000));
      expect(response.statusCode).toBe(400);
    });

    it("should return 404 for movie non existant", async () => {
        const response = await request(app)
        .put("/film/individual/new/multimedia")
        .set("Cookie", `token=${token}`)
        .set("Content-Type", "video/mp4")
        .set("X-Request-ID", 999)
        .set("Content-Range", "bytes 2000000-2999999/3000000")
        .send(Buffer.alloc(1000000));
      expect(response.statusCode).toBe(404);
    });
  });

  // /authenticate/change POST
  describe("/authenticate/change POST", () => {
    it("should change the password for crew/admin", async () => {
      const response = await request(app)
        .post("/authenticate/change")
        .set("Cookie", `token=${token}`)
        .send({ password: "new-password", mode: "crew" });
      expect(response.statusCode).toBe(200);
    });

    it("should return 400 if the password for crew/admin matches an existing password", async () => {
        const response = await request(app)
          .post("/authenticate/change")
          .set("Cookie", `token=${token}`)
          .send({ password: password, mode: "crew" });
        expect(response.statusCode).toBe(400);
      });

      it("should return 403 if unauthorised", async () => {
        const response = await request(app)
          .post("/authenticate/change")
          .set("Cookie", `token=invalid`)
          .send({ password: "hello2", mode: "crew" });
        expect(response.statusCode).toBe(403);
      });

    it("should return 400 for missing or invalid parameters", async () => {
      const response = await request(app)
        .post("/authenticate/change")
        .set("Cookie", `token=${token}`)
        .send({});
      expect(response.statusCode).toBe(400);
    });

    it("should accpept the password being changed back", async () => {
        const response = await request(app)
          .post("/authenticate/change")
          .set("Cookie", `token=${token}`)
          .send({ password: "hello", mode: "crew" });
        expect(response.statusCode).toBe(200);
      });
  });

  // /authenticate/token POST
  describe("/authenticate/token POST", () => {
    it("should verify token entitlements", async () => {
      const response = await request(app)
        .post("/authenticate/token")
        .set("Cookie", `token=${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("expiry");
      expect(response.body).toHaveProperty("level");
      expect(response.body).toHaveProperty("approval", true);
    });

    it("should return 400 for missing or invalid token", async () => {
      const response = await request(app).post("/authenticate/token");
      expect(response.statusCode).toBe(400);
    });
  });

  // /film/individual/edit POST
  describe("/film/individual/edit POST", () => {
    it("should edit movie metadata with admin token, even with partial data", async () => {
      const response = await request(app)
        .post("/film/individual/edit")
        .set("Cookie", `token=${token}`)
        .send({
          id: movieIdNew,
          title: "Updated Movie Title",
          cast: "Updated Cast"
        });

      expect(response.statusCode).toBe(200);
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/film/individual/edit")
        .set("Cookie", `token=${token}`)
        .send({id:movieIdNew,title:"&&%%"});

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 if the movie does not exist", async () => {
      const response = await request(app)
        .post("/film/individual/edit")
        .set("Cookie", `token=${token}`)
        .send({
          id: 999,
          title: "Nonexistant Movie"
        });

      expect(response.statusCode).toBe(404);
    });
  });

  // /film/individual/delete POST
  describe("/film/individual/delete POST", () => {
    it("should return 400 for missing or invalid parameters", async () => {
      const response = await request(app)
        .post("/film/individual/delete")
        .set("Cookie", `token=${token}`)
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 if the movie does not exist", async () => {
      const response = await request(app)
        .post("/film/individual/delete")
        .set("Cookie", `token=${token}`)
        .send({
          id: 999,
          title: "Nonexistant Movie",
        });

      expect(response.statusCode).toBe(404);
    });

    it("should return 406 if ID and title do not match", async () => {
      const response = await request(app)
        .post("/film/individual/delete")
        .set("Cookie", `token=${token}`)
        .send({
          id: movieIdNew,
          title: "Mismatched Title",
        });

      expect(response.statusCode).toBe(406);
    });

    it("should delete a movie with admin token and valid parameters", async () => {
        const response = await request(app)
          .post("/film/individual/delete")
          .set("Cookie", `token=${token}`)
          .send({
            id: movieIdNew,
            title: "Updated Movie Title",
          });
  
        expect(response.statusCode).toBe(200);
      });
  });
});