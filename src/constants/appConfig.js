import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default {
  ratesSocketUrl: process.env.RATES_SOCKET_URL,
  port: process.env.BACKEND_PORT,
  isDev: process.env.NODE_ENV === "development",
  mongoDBUrl: process.env.MONGODB_URL,
  mixPanelToken: process.env.MIX_PANEL_TOKEN,
  jwtSecret: process.env.JWT_SECRET,
};
