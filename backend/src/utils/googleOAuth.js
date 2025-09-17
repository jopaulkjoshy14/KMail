import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google OAuth URL
export const getGoogleAuthURL = () => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  return url;
};

// Get tokens from auth code
export const getGoogleTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens; // { access_token, id_token, refresh_token, ... }
};

// Get user info from Google
export const getGoogleUser = async (id_token, access_token) => {
  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();
  return data; // { id, email, name, picture, ... }
};
