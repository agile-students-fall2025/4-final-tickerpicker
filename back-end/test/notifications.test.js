// back-end/test/notifications.test.js
import request from "supertest";
import assert from "assert";
import app from "../server.js";

describe("Notifications API (assert version)", function () {
  this.timeout(10000); //for slow network

  let createdNotificationId;

  it("POST /api/notifications should create a new notification", async function () {
    const res = await request(app)
      .post("/api/notifications")
      .send({
        symbol: "TEST",
        eventType: "test-event",
        message: "This is a test notification from the test suite",
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.id, "response should have an id");
    assert.strictEqual(res.body.symbol, "TEST");
    assert.strictEqual(res.body.eventType, "test-event");
    assert.strictEqual(res.body.message, "This is a test notification from the test suite");
    assert.strictEqual(res.body.isRead, false);

    createdNotificationId = res.body.id;
  });

  it("GET /api/notifications should return a list including the created notification", async function () {
    const res = await request(app).get("/api/notifications");

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body), "body should be an array");

    const found = res.body.find((n) => n.id === createdNotificationId);
    assert.ok(found, "created notification should be present in /api/notifications response");
    assert.strictEqual(found.symbol, "TEST");
  });

  it("GET /api/notifications/unread-count should be >= 1 after creating unread notification", async function () {
    const res = await request(app).get("/api/notifications/unread-count");

    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.count === "number");
    assert.ok(res.body.count >= 1, "unread count should be at least 1");
  });

  it("PUT /api/notifications/:id/read should mark notification as read", async function () {
    const res = await request(app)
      .put(`/api/notifications/${createdNotificationId}/read`)
      .send();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    // Verify it is now read
    const res2 = await request(app).get("/api/notifications");
    const updated = res2.body.find((n) => n.id === createdNotificationId);

    assert.ok(updated, "updated notification should still exist");
    assert.strictEqual(updated.isRead, true);
  });
});

// Author: Lauren
