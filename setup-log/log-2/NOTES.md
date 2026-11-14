## 2026-11-14T11:52+01:00
Decision: Upgrade jest to ^30.5.2 and ts-jest to ^29.4.0 together, then run npm audit fix without --force.
Rejected: npm audit fix --force and npm overrides.
Why: The critical findings came from Jest 25 (request, form-data, node-notifier). A forced fix would reinstall jest@25.1.0. Remaining moderate minimatch and low deepmerge advisories have no safe semver fix.
