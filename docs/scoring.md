# Nexus Scoring Rules

P09 defines the Nexus score model as a deterministic aggregate of review sources.

## Source scores

- **Expert Score:** arithmetic mean of reviews whose `roleAtCreation` is `EXPERT`.
- **Creator Score:** arithmetic mean of reviews whose `roleAtCreation` is `STREAMER`.
- **Player Score:** arithmetic mean of reviews whose `roleAtCreation` is `USER`.

Scores are bounded to the 0–100 range during calculation.

## Overall Score

The intended weights are:

- Expert: **45%**
- Creator: **30%**
- Player: **25%**

When one or more sources have no reviews, missing sources contribute no weight. The available weights are renormalized so an absent source does not behave like a score of zero.

Example: if Expert and Player are present but Creator is absent, the Overall Score is:

`(Expert × 0.45 + Player × 0.25) / (0.45 + 0.25)`

If no source has reviews, the calculated Overall Score is unavailable.

## Schema compatibility

The existing Prisma schema stores score fields as non-nullable `Float` values. Therefore `0` is used as the persistence sentinel when a source or overall score has no reviews. The UI must use review counts to display **Not rated** rather than presenting that sentinel as a real zero rating.

## Creator reputation

Creator follower counts, follower relationships, posts, and discovery reach are not inputs to game scoring. A creator's follower count must never directly increase Expert, Creator, Player, or Overall Score.

## Seed data

The deterministic seed creates demo review records and then recalculates aggregate scores from those actual review records. The aggregate fields are therefore derived from the same scoring engine used at runtime rather than being independently hard-coded.

Seeded review text is explicitly demo/editorial content and is not presented as a real critic or creator quotation.
