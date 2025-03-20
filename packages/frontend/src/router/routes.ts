export const ROUTES = {
  ROOT: {
    path: "/"
  },
  LOGIN: {
    path: "/login"
  },
  HOME: {
    path: "/home"
  },
  USER: {
    path: "/user/:wallet",
    buildPath: (wallet: string) => {
      return `${ROUTES.USER.path.replace(":wallet", wallet.toLowerCase())}`;
    },
    POST: {
      path: "posts/:id",
      buildPath: (wallet: string, id: number) => {
        return `${ROUTES.USER.buildPath(wallet) + "/" + ROUTES.USER.POST.path.replace(":id", id.toString())}`;
      }
    }
  },
  MESSAGES: {
    path: "/messages"
  },
  CREDENTIALS: {
    path: "/credentials",
    REQUEST: {
      path: "/credentials/request"
    },
    INCOMING_REQUESTS: {
      path: "/credentials/incoming-requests"
    }
  },
  SUBSCRIPTIONS: {
    path: "/subscriptions"
  },
  SETTINGS: {
    path: "/settings"
  },
  WALLET: {
    path: "/wallet"
  },
  PRIVACY_POLICY: {
    path: "/privacy-policy"
  },
  EARN: {
    path: "/earn/*", // The * allows matching the entire path after /earn, including slashes
    buildPath: (embedURL?: string) => {
      try {
        // Only allow valid URLs (with http/https) to be embedded
        const url = new URL(embedURL || "");
        return `/earn/${encodeURIComponent(url.href)}`; // Use the full href as the path and encode it
      } catch (e) {
        return "/earn"; // Fallback if URL is invalid
      }
    }
  }
};
