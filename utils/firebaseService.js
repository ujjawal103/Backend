function loadServiceAccount() {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 missing");

  const jsonString = Buffer.from(base64, "base64").toString("utf8");

  const parsed = JSON.parse(jsonString);

  // Important fix: replace escaped newlines
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

  return parsed;
}

module.exports = loadServiceAccount;