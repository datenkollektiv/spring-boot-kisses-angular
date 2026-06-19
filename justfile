# Spring Boot kisses Angular — task runner

set dotenv-load := false

app_url := "http://localhost:8080/app/index.html"

# List available recipes
default:
    @just --list

# ── Development ──────────────────────────────────────────────

# Start local development server
dev:
    ./gradlew bootRun

# Open local development server in browser
open:
    open {{ app_url }}

# ── Testing ─────────────────────────────────────────────────

# Run the full quality gate as CI does (clean + Angular build + Java build + JUnit smoke)
ci:
    ./gradlew clean build

# Run backend tests only (fast — JUnit 5, no Angular rebuild)
test:
    ./gradlew test

# Run frontend unit tests only (Vitest via @angular/build, Node + jsdom)
test-ui:
    ./gradlew ngTest

# Run both backend (JUnit) and frontend (Vitest) unit tests
test-all: test test-ui

# Full pre-merge check: build + tests + container integration smoke
verify:
    scripts/verify-container.sh

# ── Build ────────────────────────────────────────────────────

# Angular production build only
ng-build:
    ./gradlew ngBuild

# Update Angular packages (currently targets @21)
ng-update:
    ./gradlew ngUpdate

# ── Container ───────────────────────────────────────────────

# Build local OCI image (macOS arm64)
image:
    ./gradlew -Dplatform.architecture=arm64 jibDockerBuild

# Rebuild image and restart container
rebuild: down image up

# Clean, rebuild image, and restart container
clean-rebuild: down clean image up

# Start container
up:
    docker compose up -d
    @echo "UI available at {{ app_url }}"

# Stop container
down:
    docker compose down

# View service logs (follow mode)
logs:
    docker compose logs -f

# ── Maintenance ─────────────────────────────────────────────

# Verify required tools are installed and at the correct versions
doctor:
    @echo "Checking development environment..."
    @./gradlew --version | grep -E '^(Gradle |Launcher JVM)'
    @docker --version
    @docker compose version
    @just --version
    @echo "Environment OK"

# Run npm vulnerability audit
npm-audit:
    ./gradlew npmAudit

# Auto-fix npm audit findings
npm-audit-fix:
    ./gradlew npmAuditFix

# Run OWASP dependency-check (Java CVE scan)
owasp:
    ./scripts/owasp-check.sh

# Clean build outputs
clean:
    ./gradlew clean
