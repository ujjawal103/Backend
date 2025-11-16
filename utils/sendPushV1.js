const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const Store = require("../models/restronStore.model");
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
  const { token } = await client.getAccessToken();

  console.log("🔥 REAL Access token:", token);

  return token; // <-- return raw token only
}


// async function sendPushNotification(tokens, title, body) {
//   try {
//     if (!tokens || tokens.length === 0) return;

//     const accessToken = await getAccessToken();

//     const url = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

//     for (const token of tokens) {
//       const payload = {
//         message: {
//           token,
//           notification: { title, body },
//         },
//       };

//       await axios.post(url, payload, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//     }

//     console.log("🔥 Push sent (HTTP v1)");
//   } catch (error) {
//     console.error("❌ Push failed:", error.response?.data || error.message);
//   }
// }

// module.exports = sendPushNotification;


async function sendPushNotification(tokens, title, body, storeId) {
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

    try {
      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("✅ Notification sent:", token);
      
    } catch (error) {
      const errMsg = JSON.stringify(error.response?.data || error.message);
      console.log("❌ Notification ERROR:", errMsg);

      // ⭐ CHECK INVALID TOKEN CONDITIONS
      if (
        errMsg.includes("NOT_FOUND") ||
        errMsg.includes("Requested entity was not found") ||
        errMsg.includes("UNREGISTERED")
      ) {
        console.log("⚠️ Removing invalid token from DB:", token);

        // remove token from DB
        await Store.findByIdAndUpdate(storeId, {
          $pull: { fcmTokens: token },
        });
      }

      // ⭐ CONTINUE LOOP FOR NEXT TOKENS
      continue;
    }
  }
}

module.exports = sendPushNotification;