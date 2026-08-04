# AGENTS.md

> Use this file as the fast-path operating guide for AI coding agents.
> Prefer repository truth over assumptions — check the files referenced below.

## Project Overview

A minimal example integrating a **Spring Boot 4.1** backend (Java 21) with an
**Angular 22** frontend, compiled into a single runnable JAR. The backend exposes
one REST endpoint; the frontend displays the build version. Everything is built
through Gradle — no local Node.js needed (the `com.github.node-gradle.node` plugin
downloads Node 24.17.0).

## Architecture

The Angular app is built to `src/generated/resources/static/app/` (regenerated each
build, not committed) and served by Spring Boot as static resources under `/app/`.

- **Backend** (`src/main/java/.../boot/angular/`): `AngularApplication` (entry point);
  `AppVersionController` — `GET /server/version` returns `{"number","buildDate"}` from
  Spring Boot `BuildProperties` (`"unknown"` fallback); `AppVersion` — immutable `record`.
  Runtime dependency: `spring-boot-starter-web`.
- **Frontend** (`src/`, not `src/main/frontend`): standalone, zoneless, signal-based
  Angular (no NgModule, no Zone.js). `main.ts` bootstraps with `provideHttpClient()` +
  `provideZonelessChangeDetection()`. `appVersion.service.ts` calls `/server/version`
  with a bounded retry (2 attempts, exponential delay, no retry on `4xx`).
  `appVersion.component.ts` is `OnPush` and exposes the version via `toSignal`.
- **Build pipeline:** `./gradlew build` → `npmInstall` → `ngBuild` → `processResources`
  → `compileJava` → `bootJar`.
- **Container:** Google Jib (no Dockerfile) → `datenkollektiv/spring-boot-kisses-angular`, port 8080.

## Development Workflow

Prefer the `justfile` recipes (`just --list`):

```sh
just dev        # bootRun — http://localhost:8080/app/index.html
just ci         # clean build — full gate (Angular + Java + both test suites)
just test       # backend JUnit smoke test only
just test-ui    # frontend Vitest tests only
just test-all   # both suites
just npm-audit  # npm --omit=dev vulnerability scan
just owasp      # OWASP dependency-check (Java CVE scan)
```

`./gradlew clean build` is the verification gate: it runs `AppVersionControllerSmokeTest`
(Spring Boot) and the Vitest suite (both wired into Gradle `check`).

## Key Conventions

- **Angular build:** uses the standalone `@angular/build:application` builder (esbuild/Vite),
  not `@angular-devkit/build-angular`. `angular.json` `outputPath` is
  `{ base: "src/generated/resources/static/app", browser: "" }` — the empty `browser`
  keeps assets flat so Spring Boot serves them at `/app/` without a `browser/` subdir.
- **Frontend tests:** Vitest via `@angular/build:unit-test` (Node + jsdom). `src/test-providers.ts`
  supplies `provideZonelessChangeDetection()` to the TestBed, matching the app bootstrap.
  Specs sit next to source as `*.spec.ts`.
- **Versioning:** Gradle `project.version` (`build.gradle`) is canonical — it drives the JAR
  name, Jib tags, the nightly artifact, and `BuildProperties`. `package.json` `version` is
  pinned `0.0.0-private` and never published.
- **npm audit:** `./gradlew npmAudit` is `--omit=dev` (gates production only). Full-tree dev
  advisories are transitive through `@angular/build` and never ship. Never run
  `npm audit fix --force` — it has proposed destructive Angular toolchain downgrades.
- **TypeScript moves in lockstep with the Angular major** (Angular 22 requires TS `>=6.0 <6.1`).
- **GitHub Actions are pinned to full-length commit SHAs**, with the release as a trailing
  comment (`uses: actions/checkout@d23441a… # v6.1.0`) — no floating tags, and no exemption
  for GitHub-owned `actions/*`. This follows GitHub's [security hardening guide][gh-harden]:
  a SHA is the only immutable reference, since a tag can be moved by anyone who compromises
  the action's repository. That is not hypothetical — the March 2025 `tj-actions/changed-files`
  attack repointed *every* existing release tag at a malicious commit across ~23,000 repos,
  and only SHA-pinned consumers were unaffected. [Immutable releases][gh-immutable] (GA
  October 2025) do not close this gap: GitHub advises action authors to keep floating major
  tags off releases precisely so they stay movable, so `@v7` is mutable even when `v7.0.1`
  is not. Resolve a SHA with `git ls-remote --tags https://github.com/<owner>/<repo>` and
  take the peeled `^{}` value for annotated tags — the unpeeled ref is the tag object, not
  the commit. `.github/dependabot.yml` keeps the pins current.

[gh-harden]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
[gh-immutable]: https://docs.github.com/en/actions/how-tos/create-and-publish-actions/using-immutable-releases-and-tags-to-manage-your-actions-releases

## Coding Principles

- **State assumptions** before starting. If a task has multiple valid interpretations, present them rather than picking silently.
- **Simplicity first.** Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios.
- **Surgical changes.** Touch only what the task requires. Do not improve adjacent code, comments, or formatting. Every changed line should trace directly to the user's request.
- When your changes create orphans (unused imports, variables, functions), remove them. Do not remove pre-existing dead code unless asked.

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

## Important Files

- `build.gradle` — build orchestration, Gradle plugins, Node pin, Jib, OWASP config
- `angular.json` — Angular builder and `test` (Vitest) target config
- `justfile` — task runner (canonical command set)
- `src/app/appVersion.service.ts`, `src/app/appVersion.component.ts` — the entire frontend behaviour
- `src/main/java/.../AppVersionController.java` — the entire backend behaviour
- `maintenance-plan.md` — maintenance workbook; `audit/` holds the audit protocols
