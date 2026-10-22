import assert from "node:assert/strict";
import test from "node:test";
import { PHONES } from "../src/data/phones.js";
import { detectDevice } from "../src/utils/detectDevice.js";

test("matches an exact model exposed by Android User-Agent Client Hints", async () => {
  const result = await detectDevice({
    userAgent: "Mozilla/5.0 (Linux; Android 14)",
    userAgentData: {
      platform: "Android",
      model: "Samsung Galaxy A54",
    },
  }, PHONES);

  assert.equal(result.platform, "Android");
  assert.equal(result.model, "Samsung Galaxy A54");
  assert.equal(result.phone.model, "Galaxy A54");
  assert.equal(result.canConfigure, true);
});

test("uses asynchronous model hints when the direct model is withheld", async () => {
  const result = await detectDevice({
    userAgent: "Mozilla/5.0 (Linux; Android 14)",
    userAgentData: {
      platform: "Android",
      model: "",
      async getHighEntropyValues(keys) {
        assert.deepEqual(keys, ["model"]);
        return { model: "Samsung Galaxy A54" };
      },
    },
  }, PHONES);

  assert.equal(result.phone.id, 19);
});

test("does not guess a catalog device for a private or unknown model", async () => {
  const result = await detectDevice({
    userAgent: "Mozilla/5.0 (Linux; Android 14)",
    userAgentData: {
      platform: "Android",
      model: "Pixel 9",
    },
  }, PHONES);

  assert.equal(result.model, "Pixel 9");
  assert.equal(result.phone, null);
  assert.equal(result.canConfigure, false);
});

test("reports generic iPhone information without inventing its model or DPI", async () => {
  const result = await detectDevice({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
  }, PHONES);

  assert.equal(result.platform, "iOS");
  assert.equal(result.model, "iPhone");
  assert.equal(result.phone, null);
});

test("falls back to platform detection when the browser withholds model hints", async () => {
  const result = await detectDevice({
    userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
    userAgentData: {
      platform: "Android",
      model: "",
      async getHighEntropyValues() {
        throw new Error("Model hints are unavailable");
      },
    },
  }, PHONES);

  assert.equal(result.platform, "Android");
  assert.equal(result.model, "");
  assert.equal(result.phone, null);
});
