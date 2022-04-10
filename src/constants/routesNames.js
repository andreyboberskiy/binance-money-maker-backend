const apiPrefix = "/api";

const authPrefix = `${apiPrefix}/auth`;
const smartOrderPrefix = `${apiPrefix}/smart-order`;

export default {
  auth: {
    index: authPrefix,
    login: `/login`,
    signUp: `/sign-up`,
    refreshToken: "/refresh-token",
  },
  smartOrder: {
    index: smartOrderPrefix,
    create: "/create",
  },
};
