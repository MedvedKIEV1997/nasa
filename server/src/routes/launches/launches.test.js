const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../utils/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /v1/launches", () => {
    test("should respond with 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "some mission",
      rocket: "some rocket ",
      target: "Kepler-1652 b",
      launchDate: "January 4, 2047",
    };
    const completeLaunchDataWithoutDate = {
      mission: "some mission",
      rocket: "some rocket ",
      target: "Kepler-1652 b",
    };
    const completeLaunchDataWithWrongDate = {
      mission: "some mission",
      rocket: "some rocket ",
      target: "Kepler-1652 b",
      launchDate: "zooooot",
    };
    test("should respond with 201", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(completeLaunchDataWithoutDate);
    });

    test("should catch missing required props", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("should catch wrong date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDataWithWrongDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
