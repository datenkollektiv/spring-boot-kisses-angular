# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add a Spring Boot smoke test for `/server/version`.

### Changed

- Modernize the platform baseline to Spring Boot 4.0.5, Angular 21.2.x, Node.js 24.14.1, TypeScript 5.9.3, and Gradle 9.4.1.
- Switch the Angular build to `browser-esbuild` and remove unused legacy TSLint, Protractor, and Zone.js wiring.
- Serve application version data from Spring Boot build metadata instead of the placeholder `42`.
- Align Jib resource placement with Spring Boot's container classpath layout.
- Reduce the frontend version-load retry budget to two attempts and skip retries on `4xx` responses.
- Parameterize the `docker-compose.yml` image tag via `IMAGE_TAG` (defaults to `latest`) so the file is not arm64-specific.

### Fixed

- Scope OWASP Dependency-Check to the deployed Java runtime classpath and disable analyzers that are noisy for this project.
- Guard `BuildProperties#getTime()` against `null` in `AppVersionController` to avoid a `NullPointerException` when build metadata is incomplete.
