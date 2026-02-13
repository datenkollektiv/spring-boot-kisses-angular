# Spring Boot kisses Angular — task runner
# https://github.com/casey/just

set dotenv-load := false

version  := `grep "^version" build.gradle | sed "s/.*'\\(.*\\)'/\\1/"`
app_url  := "http://localhost:8080/app/index.html"

# List available recipes
default:
    @just --list

# Full production build (Java + Angular)
build:
    ./gradlew clean build

# Start dev server and open the app URL
dev:
    @echo "Starting at {{ app_url }}"
    ./gradlew bootRun

# Angular production build only
ng-build:
    ./gradlew ngBuild

# Update Angular packages (currently targets @20)
ng-update:
    ./gradlew ngUpdate

# Run npm vulnerability audit
audit:
    ./gradlew npmAudit

# Auto-fix npm vulnerabilities
audit-fix:
    ./gradlew npmAuditFix

# Build Docker image (default: arm64 on Apple Silicon)
docker arch="arm64":
    ./gradlew clean -Dplatform.architecture={{ arch }} jibDockerBuild

# Run the Docker container locally
docker-run arch="arm64":
    #!/usr/bin/env sh
    if [ "{{ arch }}" = "arm64" ]; then
        tag="{{ version }}.arm64"
    else
        tag="{{ version }}"
    fi
    echo "Running image with tag $tag — {{ app_url }}"
    docker run --rm -p 8080:8080 --name spring-boot-kisses-angular \
        "datenkollektiv/spring-boot-kisses-angular:$tag"

# Update the Gradle wrapper to a specific version
gradle-wrapper version:
    ./gradlew wrapper --gradle-version {{ version }}

# ─── Maintenance ────────────────────────────────────────────

# OWASP dependency check (Java CVE scan)
owasp-check:
    ./scripts/owasp-check.sh

# Verify the project: clean build + npm audit + OWASP check (use before publishing)
verify:
    ./gradlew clean build
    ./gradlew npmAudit
    ./scripts/owasp-check.sh
