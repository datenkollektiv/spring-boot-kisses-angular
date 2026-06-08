# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Build Commands

All builds are orchestrated through Gradle. No local Node.js installation is required -- Gradle downloads Node.js 20.x automatically.

```sh
./gradlew clean build        # Full production build (Java + Angular)
./gradlew bootRun            # Start dev server at http://localhost:8080/app/index.html
./gradlew ngBuild            # Angular production build only
./gradlew npmAudit           # npm vulnerability scan
./gradlew npmAuditFix        # Auto-fix npm vulnerabilities
./gradlew ngUpdate           # Update Angular packages (currently targets @20)
./gradlew jibDockerBuild     # Build Docker image (amd64)
./gradlew -Dplatform.architecture=arm64 jibDockerBuild  # Build Docker image (arm64)
```

There is no dedicated test suite. Verification relies on a successful `./gradlew clean build`.

## Architecture

Spring Boot 3.5.x backend (Java 21) with an Angular 20 frontend compiled into a single JAR.

### Build pipeline

`./gradlew build` triggers: `npmInstall` -> `ngBuild` -> `processResources` -> `compileJava` -> `bootJar`

Angular assets are output to `src/generated/resources/static/app/` (not committed, regenerated on every build). Spring Boot serves them as static resources under the `/app/` path.

### Backend

Package: `de.datenkollektiv.examples.springframework.boot.angular`

- `AngularApplication.java` -- Spring Boot entry point
- `AppVersionController.java` -- single REST endpoint: `GET /server/version` returns `{"number":"42","buildDate":"..."}`
- `AppVersion.java` -- model with fluent builder (`withNumber()`)

Only dependency: `spring-boot-starter-web`.

### Frontend

Source lives in `src/` (not `src/main/frontend`). Key paths:

- `src/main.ts` -- bootstraps standalone app with `provideHttpClient()`
- `src/app/appVersion.component.ts` -- standalone component, selector `<app-version>`, fetches version on init
- `src/app/appVersion.service.ts` -- calls `../server/version` (relative URL from `/app/` context)
- `src/app/model/appVersion.ts` -- TypeScript model mirroring Java `AppVersion`

Angular uses standalone components (no NgModule). The service is provided directly on the component.

### Container image

Built with Google Jib (no Dockerfile). Image: `datenkollektiv/spring-boot-kisses-angular`. Port: `8080`. Supports arm64/amd64 with architecture-specific tags.

## Changelog

This project uses [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format in `CHANGELOG.md`.
When adding or changing functionality, add an entry under `## [Unreleased]` using the appropriate subsection:

- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

## Documentation Conventions

- Prefer Markdown to plain text
- **One sentence per line** for better diffs and readability
- Use proper heading hierarchy (`#`, `##`, `###`)
- Do not use numbered prefixes in headings (use `## Heading` not `## 1. Heading`)
- Use backticks for inline code: package names, types, functions, commands
- For documents longer than ~50 lines, use collapsible sections for readability:

```markdown
<details>
<summary><strong>Section Title</strong></summary>

Content here...

</details>
```

### Code Snippets

- Use `sh` (not `shell` or `bash`) for shell command fenced code blocks
- Use `java` fences for Java code and `typescript` fences for Angular/TypeScript code
- **Do not put comments inside code snippets** — place explanatory text above the snippet instead, so snippets can be run directly without errors

### Mermaid Diagrams

- Use Mermaid diagrams in `.md` files to document architecture and data flows
- Keep diagrams focused: one concern per diagram
- Use `graph TB` (top-to-bottom) for dependency flows, `graph LR` (left-to-right) for data flows

## Maintenance

See `maintenance-plan.md` for the full maintenance workbook. Audit protocols are stored in `audit/`.
