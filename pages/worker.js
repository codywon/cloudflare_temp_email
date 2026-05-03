const API_PATHS = [
  "/api/",
  "/open_api/",
  "/user_api/",
  "/admin/",
  "/telegram/",
  "/external/",
];

const hasFileExtension = (pathname) => /\.[a-zA-Z0-9]+$/.test(pathname);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const reqPath = url.pathname;

    if (API_PATHS.some((path) => reqPath.startsWith(path))) {
      return env.BACKEND.fetch(request);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404 || hasFileExtension(reqPath)) {
      return assetResponse;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  },
};
