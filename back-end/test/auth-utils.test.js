import assert from "assert";

// Ensure JWT secret is available before importing modules that require it
const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

import { signJWT, verifyJWT } from "../src/auth/jwt.js";
import { hashPassword, verifyPassword } from "../src/auth/password.js";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe("Auth helpers", function () {
  after(() => {
    process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it("signJWT and verifyJWT should round-trip a payload", function () {
    const token = signJWT({ sub: "user-123", role: "tester" }, process.env.JWT_SECRET, { expiresInSec: 60 });
    const payload = verifyJWT(token, process.env.JWT_SECRET);
    assert.strictEqual(payload.sub, "user-123");
    assert.strictEqual(payload.role, "tester");
  });

  it("verifyJWT should reject tampered signatures", function () {
    const token = signJWT({ sub: "user-123" }, process.env.JWT_SECRET, { expiresInSec: 60 });
    // Flip the last character to break the signature
    const tampered = token.slice(0, -1) + (token.slice(-1) === "a" ? "b" : "a");
    assert.throws(() => verifyJWT(tampered, process.env.JWT_SECRET), /Invalid signature/);
  });

  it("verifyJWT should reject expired tokens", function () {
    const token = signJWT({ sub: "user-123" }, process.env.JWT_SECRET, { expiresInSec: -1 });
    assert.throws(() => verifyJWT(token, process.env.JWT_SECRET), /Token expired/);
  });

  it("password hashing should verify correct password and reject incorrect", function () {
    const record = hashPassword("super-secret");
    assert.ok(record.salt);
    assert.ok(record.hash);
    assert.strictEqual(verifyPassword("super-secret", record), true);
    assert.strictEqual(verifyPassword("bad-password", record), false);
  });

  it("requireAuth should set test user in test environment", async function () {
    process.env.NODE_ENV = "test";
    const { requireAuth } = await import("../src/middleware/AuthRequirement.js");

    const req = { headers: {} };
    let nextCalled = false;
    requireAuth(req, {}, () => {
      nextCalled = true;
    });

    assert.strictEqual(req.user.sub, "test-user");
    assert.ok(nextCalled);
  });

  it("requireAuth should reject requests without Bearer token in non-test env", async function () {
    process.env.NODE_ENV = "development";
    const { requireAuth } = await import("../src/middleware/AuthRequirement.js");

    const req = { headers: {} };
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(obj) {
        this.body = obj;
        return this;
      },
    };

    requireAuth(req, res, () => {});
    assert.strictEqual(res.statusCode, 401);
    assert.deepStrictEqual(res.body, { error: "Unauthorized" });
  });

  it("requireAuth should accept valid Bearer token in non-test env", async function () {
    process.env.NODE_ENV = "development";
    const { requireAuth } = await import("../src/middleware/AuthRequirement.js");
    const token = signJWT({ sub: "abc-123" }, process.env.JWT_SECRET, { expiresInSec: 60 });

    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(obj) {
        this.body = obj;
        return this;
      },
    };

    requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.ok(nextCalled);
    assert.strictEqual(req.user.sub, "abc-123");
  });
});
