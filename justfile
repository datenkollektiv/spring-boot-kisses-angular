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

# Run all tests (backend + frontend)
test:
    ./gradlew clean build

# Run backend tests only (JUnit 5)
test-backend:
    ./gradlew test

# ── Build ────────────────────────────────────────────────────

# Full production build (Angular + Java + JAR + tests)
dist:
    ./gradlew clean build

# Angular production build only
ng-build:
    ./gradlew ngBuild

# Update Angular packages (currently targets @20)
ng-update:
    ./gradlew ngUpdate

# ── Container ───────────────────────────────────────────────

# Build local OCI image (macOS arm64)
build:
    ./gradlew -Dplatform.architecture=arm64 jibDockerBuild

# Rebuild image and restart container
rebuild: down build up

# Clean, rebuild image, and restart container
clean-rebuild: down clean build up

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
