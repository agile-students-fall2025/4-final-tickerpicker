// back-end/test/watchlist.test.js
import request from "supertest";
import assert from "assert";
import app from "../server.js";

describe("Health & Watchlist API (assert version)", function () {
  this.timeout(10000)

  let createdWatchlistId;

  it("GET /api/health should return OK", async function () {
    const res = await request(app).get("/api/health");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "OK");
  });

  it("POST /api/watchlists should create a new watchlist", async function () {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "My Test Watchlist" });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.name, "My Test Watchlist");
    assert.ok(Array.isArray(res.body.stocks));
    assert.strictEqual(res.body.stocks.length, 0);

    createdWatchlistId = res.body.id;
  });

  it("POST /api/watchlists should reject empty name", async function () {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "   " });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists should reject duplicate name", async function () {
    const res = await request(app)
      .post("/api/watchlists")
      .send({ name: "my test watchlist" });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists/:watchlistId/stocks should require symbol", async function () {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .send({});

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists/:id/stocks should return 404 for unknown watchlist", async function () {
    const res = await request(app)
      .post("/api/watchlists/99999/stocks")
      .send({ symbol: "AAPL" });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, "Watchlist not found");
  });

  it("POST /api/watchlists/:id/stocks should attempt adding a symbol", async function () {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .send({ symbol: "AAPL" });

    // Could be 200 or 400 depending on Yahoo API availability
    assert.ok(res.status === 200 || res.status === 400);

    if (res.status === 200) {
      assert.ok(res.body.watchlist);
      assert.ok(Array.isArray(res.body.watchlist.stocks));
    }
  });

  it("DELETE should remove a stock (or no-op)", async function () {
    const res = await request(app)
      .delete(`/api/watchlists/${createdWatchlistId}/stocks/AAPL`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.watchlist);
  });

  it("DELETE should return 404 for unknown watchlist", async function () {
    const res = await request(app)
      .delete(`/api/watchlists/99999/stocks/TSLA`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, "Watchlist not found");
  });

  it("GET /api/watchlists/initial should return structure", async function () {
    const res = await request(app).get("/api/watchlists/initial");

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.watchlists);
    assert.ok(res.body.priceDataMap);
  });
});

//Author: michx02
