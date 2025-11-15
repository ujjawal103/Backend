const fs = require("fs");
const path = require("path");

function loadServiceAccount() {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!base64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 missing");

  const json = Buffer.from(base64, "base64").toString("utf8");
  return JSON.parse(json);
}

module.exports = loadServiceAccount;
