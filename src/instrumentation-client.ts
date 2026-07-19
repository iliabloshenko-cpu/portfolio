import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const apiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
  "https://eu.i.posthog.com";

if (projectToken) {
  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    disable_session_recording: true,
    disable_surveys: true,
  });
}
