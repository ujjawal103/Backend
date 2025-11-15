const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const loadServiceAccount = require("./firebaseService");
const serviceAccount = loadServiceAccount();

// Scopes for FCM HTTP v1
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Get access token using GoogleAuth (correct way)
async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });

  

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  console.log("🔥 Access token:", accessToken);
  
  return accessToken;
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
          notification: { title, body },
        },
      };

      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    console.log("🔥 Push sent (HTTP v1)");
  } catch (error) {
    console.error("❌ Push failed:", error.response?.data || error.message);
  }
}

module.exports = sendPushNotification;
