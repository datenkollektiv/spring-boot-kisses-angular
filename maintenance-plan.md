# Maintenance Plan

Regular maintenance workbook for the spring-boot-kisses-angular project.
Covers build verification, dependency updates, security scanning, container builds, CI/CD, and scheduled cadence.

## Build & Test

### Local development

Start the backend with embedded Angular assets and open `http://localhost:8080/app/index.html`.

```sh
./gradlew bootRun
```

### Full production build

Angular is built via the `ngBuild` Gradle task, which runs automatically during `processResources`.
Node.js 24.x is downloaded by Gradle -- no local Node installation required.

```sh
./gradlew clean build
```

### Run tests

`./gradlew clean build` runs both test suites via Gradle `check`:

- **Backend:** `AppVersionControllerSmokeTest` (Spring Boot integration test against `/server/version`) — `just test` / `./gradlew test`.
- **Frontend:** Vitest unit tests (`@angular/build:unit-test`, Node + jsdom) for `AppVersionService` and `AppVersionComponent` — `just test-ui` / `./gradlew ngTest`.

`just test-all` runs both. The frontend suite is configured in `angular.json` (`test` target), with `tsconfig.spec.json` and `src/test-providers.ts` (which provides zoneless change detection to the TestBed, matching the app's zoneless bootstrap).

### What to verify

- `BUILD SUCCESSFUL` in Gradle output.
- Angular assets emitted to `src/generated/resources/static/app/`.
- Application starts and serves `http://localhost:8080/app/index.html`.
- The `GET /server/version` endpoint returns build metadata as `{"number":"<version>","buildDate":"<ISO instant>"}` (with `"unknown"` fallback when metadata is absent).
- `AppVersionControllerSmokeTest` reports green.

## Dependency Updates

### Java / Spring Boot

Authoritative versions live in `build.gradle` (plugins block).
To bump Spring Boot, update the `org.springframework.boot` plugin version in `build.gradle` (currently `4.1.0`).

### Node.js / Angular

Node.js version is pinned in `build.gradle` under the `node` block (currently `24.17.0`).
Angular is built through Gradle's `ngBuild` task using `@angular/cli`.

To update Angular dependencies:

```sh
./gradlew ngUpdate
```

This runs `ng update @angular/core@22 @angular/cli@22`.
For major Angular version upgrades, update the `args` in the `ngUpdate` task in `build.gradle` and adjust `package.json` accordingly.
Note that within a patch train, `@angular/core` may release patches ahead of `@angular/build` / `@angular/cli` — pin core and the build/CLI packages independently when they diverge (e.g. core `22.0.2` with build/CLI `22.0.3`).
Angular pins the TypeScript range tightly (Angular 22 requires TypeScript `>=6.0 <6.1`), so TypeScript must move in lockstep with the Angular major — bump `typescript` in `package.json` as part of the same upgrade.
The build is `@angular/build:application` (esbuild/Vite); there is no `@angular-devkit/build-angular` dependency.

After any Angular update, run a full build to verify.

### Gradle

Check the wrapper version against the latest release at `https://gradle.org/releases/`.

```sh
./gradlew wrapper --gradle-version <new-version>
```

Run it **twice** — the first invocation updates `gradle-wrapper.properties`, the second regenerates the `gradlew` / `gradlew.bat` scripts.

**Standing post-step:** the wrapper task rewrites `retries=0` in `gradle-wrapper.properties` on every regeneration (a Gradle 9.5+ default).
Restore the project's chosen `retries=3` after every wrapper bump, otherwise the distribution download fails fast on transient CI network errors.
Leave the regenerated `gradlew` / `gradlew.bat` churn as-is — it is canonical output, and reverting it diverges from the official scripts.

Then rebuild to verify compatibility.

### Gradle plugins

Each plugin in `build.gradle` has a comment linking to its version page.
Review each link and bump the version number as needed:

| Plugin                            | Current Version | Version Page                                                      |
|-----------------------------------|-----------------|-------------------------------------------------------------------|
| `org.springframework.boot`        | 4.1.0           | https://plugins.gradle.org/plugin/org.springframework.boot        |
| `io.spring.dependency-management` | 1.1.7           | https://plugins.gradle.org/plugin/io.spring.dependency-management |
| `com.github.node-gradle.node`     | 7.1.0           | https://plugins.gradle.org/plugin/com.github.node-gradle.node     |
| `com.google.cloud.tools.jib`      | 3.5.4           | https://plugins.gradle.org/plugin/com.google.cloud.tools.jib      |
| `org.owasp.dependencycheck`       | 12.2.2          | https://plugins.gradle.org/plugin/org.owasp.dependencycheck       |

### npm audit

Run an npm vulnerability audit.

```sh
./gradlew npmAudit
```

Auto-fix where possible.

```sh
./gradlew npmAuditFix
```

## Security Scanning

### npm audit

The primary npm security scanning tool is `npm audit`, run through Gradle.
The Gradle task scopes `npm audit --omit=dev`, so it gates only the **production** dependency tree.

```sh
./gradlew npmAudit
```

The full dev tree (`npm audit` without `--omit=dev`) surfaces high/moderate advisories transitive through `@angular/build`'s esbuild/Vite toolchain (`vite`, `esbuild`, `piscina`, `undici`).
These are dev-only — they live inside the Angular build/dev-server toolchain and never ship in the built JAR or the container image.
We rely on Angular's release cadence to update them.
The production gate stays at 0; the full-tree count is informational only.

Note: the project deliberately uses the standalone `@angular/build` package (not `@angular-devkit/build-angular`), which avoids dragging in the legacy webpack toolchain (`webpack-dev-server`, `@ngtools/webpack`, `sockjs`, …) and the bulk of its dev-only advisories.
When a future Angular bump is applied, run a non-breaking `./gradlew npmAuditFix` (`npm audit fix`, no `--force`) afterwards to clear any newly-fixable transitive dev advisories — never use `npm audit fix --force`, which has been observed proposing destructive major *downgrades* of the Angular toolchain.

### OWASP Dependency Check

Scans **Java runtime classpath** only.
JavaScript dependencies are excluded via `nodeAuditEnabled = false` and `nodeEnabled = false` in the analyzers block (covered by npm audit).

```sh
./gradlew dependencyCheckAnalyze
```

False positives are suppressed in `owasp-suppressions.xml` with a `<notes>` justification.

### Acting on results

- Review each advisory in the output.
- For JavaScript dependencies: update `package.json`, run `./gradlew npmAuditFix`, rebuild.
- For Java dependencies: check Spring Boot release notes for security fixes and bump the Spring Boot plugin version in `build.gradle`.
- If a vulnerability has no fix available, document the risk and any mitigations applied.
- For OWASP false positives, add a suppression entry to `owasp-suppressions.xml` with a `<notes>` explaining why.

## Container Build

### Local Docker image (macOS arm64)

Build a single-architecture image for local testing.

```sh
./gradlew clean -Dplatform.architecture=arm64 jibDockerBuild
```

### Local Docker image (amd64, default)

```sh
./gradlew clean jibDockerBuild
```

### Running the container

```sh
docker run --rm -p 8080:8080 --name spring-boot-kisses-angular datenkollektiv/spring-boot-kisses-angular:latest
```

Or via `docker-compose.yml` (set `IMAGE_TAG` if you built an arch-specific tag like `latest.arm64`):

```sh
docker compose up
```

Then open `http://localhost:8080/app/index.html`.

### Image tagging

Tag sets depend on the build invocation, not a single build emitting both architectures.
An amd64 build (the default `./gradlew jibDockerBuild`) emits `[latest, <version>]` (e.g., `latest`, `0.6.0`).
An arm64 build (`./gradlew -Dplatform.architecture=arm64 jibDockerBuild`) emits `[latest.arm64, <version>.arm64]` (e.g., `latest.arm64`, `0.6.0.arm64`).
The two tag sets are produced from separate builds and are not co-published.
The version is defined in `build.gradle` (currently `0.6.0`).

## CI/CD

### GitHub Actions

Two workflows are configured in `.github/workflows/`:

**On push / PR** (`gradle-on-push-build-actions.yml`):
- Triggers on push to `main` and on pull requests.
- Sets up JDK 21 (Temurin) via `actions/setup-java`, configures Gradle via `gradle/actions/setup-gradle`, runs `./gradlew build`.
- Every action is pinned to a full-length commit SHA with the release as a trailing comment; Dependabot bumps them weekly (see `.github/dependabot.yml`). The workflow files are the source of truth for the current pins — do not mirror version numbers here.
- Uploads build artifacts to GitHub.

**Nightly build** (`gradle-nightly-build-actions.yml`):
- Runs at 2 AM UTC daily.
- Builds and uploads a nightly release artifact tagged as `nightly` via `softprops/action-gh-release` (SHA-pinned), marked `prerelease`.
- A staging step discovers the bootable JAR dynamically (`find build/libs -maxdepth 1 -name '*.jar' ! -name '*-plain.jar'`) and copies it to a **static, version-independent** `spring-boot-kisses-angular-nightly.jar`. The static name is deliberate: `overwrite_files` only replaces an asset of the *same* name, so a version-stamped name would leave stale JARs accumulating on the fixed `nightly` tag every time the project version bumps.
- Reads the project version at runtime via `./gradlew -q printVersion` and surfaces it in the release **body** (not the artifact name).

### What to verify after CI changes

- GitHub Actions workflows pass on the `main` branch.
- Nightly build artifacts are uploaded correctly.
- The "Read project version" step in `gradle-nightly-build-actions.yml` produces a non-empty `version` output that matches `build.gradle`.

## Scheduled Maintenance Cadence

### Monthly

- [ ] Run `./gradlew clean build` and verify the build succeeds.
- [ ] Run `./gradlew npmAudit` and address any findings.
- [ ] Run `./gradlew dependencyCheckAnalyze` and review CVE findings.
- [ ] Check for Gradle plugin updates (review links in `build.gradle`).
- [ ] Check for Node.js patch releases and update `build.gradle` if needed.
- [ ] Verify GitHub Actions workflows are passing.

### Quarterly

- [ ] Bump Spring Boot to the latest patch release.
- [ ] Update Angular and npm dependencies (`./gradlew ngUpdate` or manual `package.json` edits).
- [ ] Run a full build and test cycle (`./gradlew clean build`).
- [ ] Verify the nightly build artifact version in `gradle-nightly-build-actions.yml` is up to date.
- [ ] Build and test a Docker image locally (`./gradlew clean jibDockerBuild`).
- [ ] Evaluate major version upgrades (Java, Spring Boot, Angular, Gradle).
- [ ] Review CI/CD pipeline configuration (GitHub Actions workflow versions).
- [ ] Review and update this maintenance plan.

## Maintenance Protocol

Each maintenance cycle produces files in the `audit/` directory:
1. `YYYY-MM-DD-<cadence>-audit.md` — read-only assessment
2. `YYYY-MM-DD-<cadence>-plan.md` — executable plan of changes
3. `YYYY-MM-DD-<cadence>-maintenance.md` — record of what was applied

### Purpose

Separating audit from maintenance provides a clear before/after picture, makes it easier to review what was changed and why, and ensures findings are documented even if maintenance is deferred.

### Existing protocols

Protocols are stored in the `audit/` directory at the project root.
