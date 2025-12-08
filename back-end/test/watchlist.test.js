// back-end/test/watchlist.test.js
import request from "supertest";
import assert from "assert";
import app from "../server.js";
import { signJWT } from "../src/auth/jwt.js";
import { User } from "../src/data/users.js";

// Use JWT from env if provided, otherwise fall back to a test secret
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_SECRET = JWT_SECRET;
const AUTH_HEADER = {
  Authorization: `Bearer ${signJWT({ sub: "test-user" }, JWT_SECRET, { expiresInSec: 3600 })}`,
};

// Lightweight mock user to avoid real DB dependency during tests
const mockUser = {
  id: "test-user",
  watchlists: [],
  async save() {
    return this;
  },
};
let originalFindOne;

describe("Health & Watchlist API (assert version)", function () {
  this.timeout(10000) // for slow network

  let createdWatchlistId;

  before(() => {
    originalFindOne = User.findOne;
    User.findOne = async () => mockUser;
  });

  after(() => {
    User.findOne = originalFindOne;
    mockUser.watchlists = [];
  });

  it("GET /api/health should return OK", async function () {
    const res = await request(app).get("/api/health");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "OK");
  });

  it("POST /api/watchlists should create a new watchlist", async function () {
    const res = await request(app)
      .post("/api/watchlists")
      .set(AUTH_HEADER)
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
      .set(AUTH_HEADER)
      .send({ name: "   " });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists should reject duplicate name", async function () {
    const res = await request(app)
      .post("/api/watchlists")
      .set(AUTH_HEADER)
      .send({ name: "my test watchlist" });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists/:watchlistId/stocks should require symbol", async function () {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .set(AUTH_HEADER)
      .send({});

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/watchlists/:id/stocks should return 404 for unknown watchlist", async function () {
    const res = await request(app)
      .post("/api/watchlists/99999/stocks")
      .set(AUTH_HEADER)
      .send({ symbol: "AAPL" });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, "Watchlist not found");
  });

  it("POST /api/watchlists/:id/stocks should attempt adding a symbol", async function () {
    const res = await request(app)
      .post(`/api/watchlists/${createdWatchlistId}/stocks`)
      .set(AUTH_HEADER)
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
      .delete(`/api/watchlists/${createdWatchlistId}/stocks/AAPL`)
      .set(AUTH_HEADER);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.watchlist);
  });

  it("DELETE should return 404 for unknown watchlist", async function () {
    const res = await request(app)
      .delete(`/api/watchlists/99999/stocks/TSLA`)
      .set(AUTH_HEADER);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, "Watchlist not found");
  });

  it("GET /api/watchlists/initial should return structure", async function () {
    const res = await request(app).get("/api/watchlists/initial").set(AUTH_HEADER);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.watchlists);
    assert.ok(res.body.priceDataMap);
  });
});

//Author: michx02
