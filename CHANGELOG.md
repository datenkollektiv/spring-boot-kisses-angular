# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add a Spring Boot smoke test for `/server/version`.
- Add a dedicated `printVersion` Gradle task so CI can read the project version without grepping `gradlew properties` output.
- Add a frontend unit test suite using Vitest via the `@angular/build:unit-test` builder (Node + jsdom), covering `AppVersionService` (happy path, no-retry-on-`4xx`, retry-on-`5xx`) and `AppVersionComponent` (loading, loaded, and error states). Run with `just test-ui` / `just test-all` (or `./gradlew ngTest`); wired into Gradle `check` so `./gradlew build` runs it alongside the JUnit smoke test.

### Changed

- Modernize the platform baseline to Spring Boot 4.1.0, Angular 22.0.x, Node.js 24.17.0, TypeScript 6.0.x, and Gradle 9.6.0.
- Migrate the Angular build from `@angular-devkit/build-angular:browser-esbuild` to the standalone `@angular/build:application` builder (esbuild/Vite), removing the `@angular-devkit/build-angular` dev dependency and the bundled legacy webpack toolchain (`webpack-dev-server`, `@angular-devkit/build-webpack`, `@ngtools/webpack`, `sockjs`, …) it dragged in even though the project already built with esbuild.
- Adapt `angular.json` to the `:application` builder schema: rename the entry option `main` → `browser`, and set `outputPath` to `{ "base": "src/generated/resources/static/app", "browser": "" }`. The empty `browser` is deliberate — it keeps the built assets flat under `static/app/` (instead of nesting them in a `browser/` subdirectory) so Spring Boot keeps serving them at the same paths. The webpack-only flags `namedChunks`, `vendorChunk`, and `buildOptimizer` were dropped as they are not part of the modern builder.
- Remove unused legacy TSLint, Protractor, and Zone.js wiring (earlier modernization).
- Serve application version data from Spring Boot build metadata instead of the placeholder `42`.
- Align Jib resource placement with Spring Boot's container classpath layout.
- Reduce the frontend version-load retry budget to two attempts and skip retries on `4xx` responses.
- Parameterize the `docker-compose.yml` image tag via `IMAGE_TAG` (defaults to `latest`) so the file is not arm64-specific.
- Upgrade Angular from 21 to 22 (`@angular/core` `22.0.2`; `@angular/build` and `@angular/cli` `22.0.3`) and TypeScript from 5.9 to 6.0 (`6.0.3`), which Angular 22 requires. Node.js 24.17.0 and RxJS 7.8.2 already satisfy Angular 22's supported ranges, and the app was already on the v22-friendly idioms (zoneless, standalone, signals, `OnPush` — now the default). Removed the deprecated `baseUrl` from `tsconfig.json` (unused under `moduleResolution: "bundler"`; TypeScript 6.0 raises an error on it). The upgrade further trims the dev-only build-toolchain advisory surface (7 → 5).
- Bump the JUnit BOM to `6.1.0`.
- Bump the OWASP `dependency-check` Gradle plugin to `12.2.2`.
- Bump GitHub Actions versions: `actions/checkout@v6`, `actions/setup-java@v5`, `gradle/actions/setup-gradle@v6`.
- Bump `actions/upload-artifact` from `v4` to `v7`, clearing the Node 20 deprecation warning on the runners. `v4` and `v5` both run on `node20`; `v6` is the earliest Node 24 major. No input changes — `v7`'s new `archive` input defaults to `true`, preserving the existing upload of `build/libs`.
- Pin every GitHub Action to a full-length commit SHA with the release as a trailing comment, replacing the previous mix of floating major tags and one SHA pin. No behaviour change: each floating tag already resolved to the commit now pinned. Rationale and the SHA-resolution procedure are in `AGENTS.md` under "Key Conventions".
- Add `.github/dependabot.yml` enabling Dependabot version updates for `github-actions` (weekly, grouped into one PR), which is what keeps the SHA pins from going stale. `npm` and `gradle` are intentionally excluded.
- Bump `actions/checkout` from `v6.1.0` to `v7.0.1` and `softprops/action-gh-release` from `v3.0.0` to `v3.0.2` (first grouped Dependabot bump). The `checkout` major is a no-op here: `v7`'s breaking change blocks fork-PR checkout for `pull_request_target` and `workflow_run`, neither of which this project uses (`push`, `pull_request`, and `schedule` only), and its `action.yml` is byte-identical to `v6.1.0` — same inputs, same defaults, still `node24` — because `v6.1.0` had already backported `allow-unsafe-pr-checkout`. `v3.0.2` of `action-gh-release` is release-reliability fixes (draft-release reuse, hardened streamed asset uploads, clearer creation diagnostics) with no input changes.
- De-hardcode the nightly workflow artifact name; it now resolves the project version at runtime via `./gradlew -q printVersion`.
- Migrate the nightly release step from the unmaintained `djnicholson/release-action@v2.11` (no release since 2020) to `softprops/action-gh-release`, pinned to the `v3.0.0` commit SHA for supply-chain reproducibility and marked `prerelease`.
- Upload the nightly JAR under a static, version-independent `spring-boot-kisses-angular-nightly.jar` (discovered dynamically, excluding the `-plain.jar`) so repeated runs against the fixed `nightly` tag cleanly replace the single artifact instead of accumulating stale version-named JARs; the build version is surfaced in the release body instead.
- Decouple the `package.json` version from the project release version by pinning it to `0.0.0-private`; the source of truth is `build.gradle` `version` (consumed by Jib tags, the JAR name, and CI release naming).
- Drop the `src/environments/*.ts` files, the `angular.json` `fileReplacements` block, and the `enableProdMode()` call in `src/main.ts`; Angular 21 production mode is implied by `ng build --configuration=production` via the optimization toolchain, so the single-boolean scaffold added no behaviour.

### Fixed

- Scope OWASP Dependency-Check to the deployed Java runtime classpath and disable analyzers that are noisy for this project.
- Guard `BuildProperties#getTime()` against `null` in `AppVersionController` to avoid a `NullPointerException` when build metadata is incomplete.
- Disable the OWASP `NodePackageAnalyzer` (`nodeEnabled = false`) so OWASP no longer duplicates `npm audit` coverage by scanning `node_modules`.

### Security

- Bump Spring Boot to `4.0.6` to pick up the June 2026 security patch line ([CVE-2026-40970](https://www.cve.org/CVERecord?id=CVE-2026-40970) through [CVE-2026-40977](https://www.cve.org/CVERecord?id=CVE-2026-40977)); none of the directly affected components are used by this project, but the bump keeps us on the supported patch line.
- Bump Angular core to `21.2.17` to fix three advisories in the production bundle: [GHSA-48r7-hpm6-gfxm](https://github.com/advisories/GHSA-48r7-hpm6-gfxm) (high, DoS via OOM in `formatDate`), [GHSA-39pv-4j6c-2g6v](https://github.com/advisories/GHSA-39pv-4j6c-2g6v) (high, weak 32-bit `HttpTransferCache` cache-key hashing), and [GHSA-58w9-8g37-x9v5](https://github.com/advisories/GHSA-58w9-8g37-x9v5) (moderate, two-way binding sanitization bypass / XSS).
- Reduce the dev-only (build toolchain) advisory surface from 22 to 7 Dependabot alerts by migrating off the webpack-bundling `@angular-devkit/build-angular` to `@angular/build` and running a non-breaking `npm audit fix`.
- None of these advisories ever shipped in the production bundle or container image (`npm audit --omit=dev` remained `0` throughout); the remaining 7 are transitive through `@angular/build`'s esbuild/Vite core (`vite`, `esbuild`, `piscina`, `undici`) and are gated on upstream Angular releases.
