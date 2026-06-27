import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (token) {
    posthog.init(token, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-05-30",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  } else {
    console.warn("PostHog project token is missing. Client-side tracking is disabled.");
  }
}
