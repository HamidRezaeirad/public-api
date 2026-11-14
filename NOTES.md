## 2026-11-14T12:46+01:00
Decision: Pin glob to 14.0.6, and the typescript-eslint and test-exclude copies of minimatch to 11.0.8, with npm overrides.
Rejected: `npm audit fix --force`, and a global minimatch override.
Why: Force would downgrade Jest 30 to 25. A global minimatch pin would replace ESLint's minimatch 3. deepmerge 4.3.1 has no patched release, so those lows stay; Jest only uses it to merge local config.
