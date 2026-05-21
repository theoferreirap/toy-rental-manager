export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  let oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  if (!oauthPortalUrl || oauthPortalUrl === "undefined" || oauthPortalUrl === "null" || !oauthPortalUrl.startsWith("http")) {
    oauthPortalUrl = "https://auth.manus.im";
  }

  let appId = import.meta.env.VITE_APP_ID;
  if (!appId || appId === "undefined" || appId === "null") {
    appId = "dummy-app-id";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (e) {
    console.error("Invalid URL in getLoginUrl, falling back to default.", e);
    const url = new URL("https://auth.manus.im/app-auth");
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  }
};
