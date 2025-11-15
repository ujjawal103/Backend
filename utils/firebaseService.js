function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  console.log("🔥 RAW ENV EXISTS:", !!raw);
  console.log("🔥 RAW LENGTH:", raw ? raw.length : 0);

  console.log("🔥 ENV LINE COUNT:", process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.split("\n").length);


  let jsonString = Buffer.from(raw, "base64").toString("utf8");

  console.log("🔥 DECODED FIRST 200 CHARS:");
  console.log(jsonString.slice(0, 200));

  let parsed = JSON.parse(jsonString);

  console.log("🔥 PARSED KEYS:", Object.keys(parsed));

  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

  console.log("🔥 PRIVATE KEY CONTAINS HEADER:", parsed.private_key.includes("BEGIN PRIVATE KEY"));

  return parsed;
}

module.exports = loadServiceAccount;