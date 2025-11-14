# Lessons Learned — 2025-11-13

- Standardize references to the temporary workspace as `.ai_working/` across new rules; audit legacy documents for lingering `.ai-working/` mentions before next session.
- Codifying Dynamoose integration patterns early prevents table-creation regressions and should be checked whenever touching persistence layers.
- Running Prettier manually before staging avoids Husky rejections and keeps commit loops fast.
