'use strict';

const {app} = require("./app");
const request = require("supertest");

describe("Tests the APIs",()=>{
    test("GET /review/fetch?id=1 succeeds",()=>{
        return request(app).get("/review/fetch?id=1").expect(200);
    });
});