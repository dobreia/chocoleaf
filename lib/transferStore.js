// lib/transferStore.js
export const transferStore = new Map();

export function makeIntentId(prefix = "tr") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
