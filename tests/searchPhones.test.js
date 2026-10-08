import assert from "node:assert/strict";
import test from "node:test";
import { searchPhones } from "../src/utils/searchPhones.js";

const phones = [
  { id: 1, brand: "Samsung", model: "Galaxy A54" },
  { id: 2, brand: "Xiaomi", model: "Redmi Note 12" },
  { id: 3, brand: "Motorola", model: "Moto G85" },
];

test("matches brand and model terms when words are omitted", () => {
  assert.deepEqual(searchPhones("Samsung A54", phones), [phones[0]]);
});

test("matches case-insensitively and ignores accents and punctuation", () => {
  assert.deepEqual(searchPhones("MÓTO-G85!", phones), [phones[2]]);
});

test("returns no results for blank or punctuation-only searches", () => {
  assert.deepEqual(searchPhones("   ", phones), []);
  assert.deepEqual(searchPhones("!!!", phones), []);
});