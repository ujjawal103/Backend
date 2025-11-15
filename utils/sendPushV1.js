const { google } = require("google-auth-library");
const axios = require("axios");
const serviceAccount = require("../service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

async function getAccessToken() {
  const client = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES
  );

  const tokens = await client.authorize();
  return tokens.access_token;
}

async function sendPushNotification(tokens, title, body) {
  try {
    if (!tokens || tokens.length === 0) return;

    const accessToken = await getAccessToken();

    const url = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

    for (const token of tokens) {
      const payload = {
        message: {
          token,
          notification: {
            title,
            body,
          }
        }
      };

      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    console.log("Push sent (HTTP v1)");
  } catch (error) {
    console.error("Push failed:", error.response?.data || error.message);
  }
}

module.exports = sendPushNotification;
