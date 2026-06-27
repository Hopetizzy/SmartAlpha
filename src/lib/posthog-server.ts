import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    // Return a mock object typed as PostHog
    return {
      capture: (options: any) => {
        console.log("[MOCK POSTHOG] Capture event:", options.event, options.properties);
      },
      identify: (options: any) => {
        console.log("[MOCK POSTHOG] Identify distinctId:", options.distinctId, options.properties);
      },
      shutdown: async () => {},
    } as unknown as PostHog;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

