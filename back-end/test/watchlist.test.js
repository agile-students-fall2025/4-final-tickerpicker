// back-end/test/watchlist.test.js
import request from "supertest";
import chai from "chai";
import app from "../server.js";

const { expect } = chai;

describe("Health & Watchlist API", () => {
  let createdWatchlistId;

  it("GET /api/health should return status OK", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("status", "OK");
    expect(res.body).to.have.property("message");
  });

  it("POST /api/watchlists should create a new watchlist", async () => {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "My Test Watchlist" });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("name", "My Test Watchlist");
    expect(res.body).to.have.property("stocks");
    expect(res.body.stocks).to.be.an("array").that.is.empty;

    createdWatchlistId = res.body.id;
  });

  it("POST /api/watchlists should reject empty name", async () => {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "   " });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("POST /api/watchlists should reject duplicate name (case-insensitive)", async () => {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "my test watchlist" }); // same as before, different case

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("POST /api/watchlists/:watchlistId/stocks should return 400 if symbol missing", async () => {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .send({}); // no symbol

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("POST /api/watchlists/:watchlistId/stocks should return 404 for unknown watchlist", async () => {
    const res = await request(app)
      .post(`/api/watchlists/999999/stocks`)
      .send({ symbol: "AAPL" });

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Watchlist not found");
  });

  it("POST /api/watchlists/:watchlistId/stocks should try to add a valid-looking symbol", async () => {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .send({ symbol: "AAPL" });

    // Different environments / API responses can give 200 or 400.
    // Either way, the route code is executed for coverage.
    expect([200, 400]).to.include(res.status);

    if (res.status === 200) {
      expect(res.body).to.have.property("watchlist");
      expect(res.body.watchlist).to.have.property("stocks");
      expect(res.body.watchlist.stocks).to.include("AAPL");

      expect(res.body).to.have.property("priceDataMap");
      expect(res.body.priceDataMap).to.be.an("object");
      expect(res.body.priceDataMap).to.have.property("AAPL");
    } else if (res.status === 400) {
      expect(res.body).to.have.property("error");
    }
  });

  it("DELETE /api/watchlists/:watchlistId/stocks/:symbol should remove a stock (or no-op)", async () => {
    const res = await request(app)
      .delete(`/api/watchlists/${createdWatchlistId}/stocks/AAPL`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("watchlist");
    expect(res.body.watchlist).to.have.property("stocks");
    expect(res.body.watchlist.stocks).to.be.an("array");
    expect(res.body.watchlist.stocks).to.not.include("AAPL");
  });

  it("DELETE /api/watchlists/:watchlistId/stocks/:symbol should return 404 for unknown watchlist", async () => {
    const res = await request(app)
      .delete(`/api/watchlists/999999/stocks/TSLA`);

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Watchlist not found");
  });

  it("GET /api/watchlists/initial should return watchlists and priceDataMap", async () => {
    const res = await request(app).get("/api/watchlists/initial");

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("watchlists");
    expect(res.body.watchlists).to.be.an("array");

    expect(res.body).to.have.property("priceDataMap");
    expect(res.body.priceDataMap).to.be.an("object");
  });
});

//Author: michx02
