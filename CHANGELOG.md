# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add a Spring Boot smoke test for `/server/version`.
- Add a dedicated `printVersion` Gradle task so CI can read the project version without grepping `gradlew properties` output.

### Changed

- Modernize the platform baseline to Spring Boot 4.0.6, Angular 21.2.x, Node.js 24.16.0, TypeScript 5.9.3, and Gradle 9.5.1.
- Switch the Angular build to `browser-esbuild` and remove unused legacy TSLint, Protractor, and Zone.js wiring.
- Serve application version data from Spring Boot build metadata instead of the placeholder `42`.
- Align Jib resource placement with Spring Boot's container classpath layout.
- Reduce the frontend version-load retry budget to two attempts and skip retries on `4xx` responses.
- Parameterize the `docker-compose.yml` image tag via `IMAGE_TAG` (defaults to `latest`) so the file is not arm64-specific.
- Bump Angular core to `21.2.16` and Angular CLI / devkit to `21.2.14` (the CLI / devkit train is one patch behind core within `21.2.x`).
- Bump the JUnit BOM to `6.1.0`.
- Bump the OWASP `dependency-check` Gradle plugin to `12.2.2`.
- Bump GitHub Actions versions: `actions/checkout@v6`, `actions/setup-java@v5`, `gradle/actions/setup-gradle@v6`.
- De-hardcode the nightly workflow artifact name; it now resolves the project version at runtime via `./gradlew -q printVersion`.
- Decouple the `package.json` version from the project release version by pinning it to `0.0.0-private`; the source of truth is `build.gradle` `version` (consumed by Jib tags, the JAR name, and CI release naming).
- Drop the `src/environments/*.ts` files, the `angular.json` `fileReplacements` block, and the `enableProdMode()` call in `src/main.ts`; Angular 21 production mode is implied by `ng build --configuration=production` via the optimization toolchain, so the single-boolean scaffold added no behaviour.

### Fixed

- Scope OWASP Dependency-Check to the deployed Java runtime classpath and disable analyzers that are noisy for this project.
- Guard `BuildProperties#getTime()` against `null` in `AppVersionController` to avoid a `NullPointerException` when build metadata is incomplete.
- Disable the OWASP `NodePackageAnalyzer` (`nodeEnabled = false`) so OWASP no longer duplicates `npm audit` coverage by scanning `node_modules`.

### Security

- Bump Spring Boot to `4.0.6` to pick up the June 2026 security patch line (CVE-2026-40970..40977); none of the directly affected components are used by this project, but the bump keeps us on the supported patch line.
