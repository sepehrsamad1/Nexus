# P10 External/Public-Source Integrations

P10 adds optional adapters for public game-trailer metadata and public Reddit references.

## Default behavior

External integrations are **disabled by default**. The normal Nexus seed/build/test flow does not require external credentials or live network calls.

Run:

`npm run external:sync`

The command is intentionally a separate sync step. It reads configuration, imports only configured sources, and uses the stored `retrievedAt` timestamp to skip fresh cached records.

## YouTube trailer adapter

The trailer adapter accepts explicit HTTPS YouTube URLs configured in `NEXUS_YOUTUBE_TRAILER_URLS_JSON`. It reads public video metadata through YouTube's public/oEmbed-style metadata endpoint and stores the source URL, canonical URL, title, channel display name when available, thumbnail metadata, and retrieval time.

The adapter does **not** search for a trailer and does not infer that a video is official. The configured URL must be selected by the Nexus owner as the verified official publisher/developer trailer. The Data API remains optional and is not required for this adapter.

Nexus never downloads or re-hosts the video.

## Reddit adapter

Reddit's current external Data API access is credentialed. The adapter therefore does nothing when `REDDIT_ACCESS_TOKEN` is absent, even if the Reddit adapter flag is enabled.

When an approved token is supplied, the adapter reads a specific public post by URL, stores only normalized reference metadata/excerpt, and preserves the original permalink. The external author remains an external identity and is never created or impersonated as a Nexus user.

## Stored metadata

`ExternalReference` preserves:

- source/provider
- original source URL
- canonical URL
- external identifier
- title/excerpt
- external author display name when supplied
- published timestamp when supplied
- Nexus retrieval timestamp
- attribution
- provider metadata JSON
- `isDemoEditorial` fallback flag

## Demo fallback

Because live integrations are optional, the seed includes a small set of **Nexus Editorial Demo** references. They are clearly labeled in the UI and do not pretend to be imported user posts, creator statements, or verified official trailers.

Replace those demo references with verified configured sources when a live integration is safely available.

## Configuration example

```env
NEXUS_EXTERNAL_INTEGRATIONS_ENABLED="true"
NEXUS_EXTERNAL_CACHE_HOURS="24"

NEXUS_YOUTUBE_TRAILER_ADAPTER_ENABLED="true"
NEXUS_YOUTUBE_TRAILER_URLS_JSON='[{"gameSlug":"elden-ring","url":"https://www.youtube.com/watch?v=VIDEO_ID"}]'

NEXUS_REDDIT_ADAPTER_ENABLED="false"
NEXUS_REDDIT_REFERENCE_URLS_JSON='[{"gameSlug":"elden-ring","url":"https://www.reddit.com/r/Eldenring/comments/POST_ID/example/"}]'
# REDDIT_ACCESS_TOKEN="..."
```

Do not put credentials in source control.

## Safety rules

- Read-only external integration only.
- HTTPS and host allowlists are enforced.
- No automated searching across external communities.
- No user impersonation.
- No follower/reputation effects from imported references.
- No live Reddit requests without explicit credentials.
- Cache before refresh; never poll on every page request.
- If a source cannot be safely configured, keep the Nexus editorial/demo fallback.
