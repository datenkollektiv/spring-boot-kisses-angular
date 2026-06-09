#!/usr/bin/env bash
set -euo pipefail
# verify-container.sh — build OCI image, run container, smoke-check endpoints
# Usage: scripts/verify-container.sh  (no arguments; host arch auto-detected)

case "$(uname -m)" in
    arm64|aarch64) platform_arg="-Dplatform.architecture=arm64"; image_tag="latest.arm64" ;;
    x86_64|amd64)  platform_arg="";                              image_tag="latest"       ;;
    *) echo "Unsupported host architecture: $(uname -m)" >&2; exit 1 ;;
esac

echo "==> verify: host=$(uname -m), IMAGE_TAG=${image_tag}"

echo "==> ./gradlew clean build"
./gradlew clean build

echo "==> Building OCI image via Jib"
if [[ -n "${platform_arg}" ]]; then
    ./gradlew "${platform_arg}" jibDockerBuild
else
    ./gradlew jibDockerBuild
fi

export IMAGE_TAG="${image_tag}"
trap 'docker compose down --remove-orphans >/dev/null 2>&1 || true' EXIT
echo "==> docker compose up -d"
docker compose up -d

echo "==> Waiting for /server/version (timeout 30s)"
deadline=$((SECONDS + 30))
until curl -fsS http://localhost:8080/server/version > /dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
        echo "Container did not become ready within 30s; recent logs:" >&2
        docker compose logs --tail=50 >&2
        exit 1
    fi
    sleep 1
done

version_body=$(curl -fsS http://localhost:8080/server/version)
echo "    /server/version -> ${version_body}"
if ! grep -q '"number"' <<<"${version_body}" || ! grep -q '"buildDate"' <<<"${version_body}"; then
    echo "Unexpected /server/version response shape" >&2
    exit 1
fi

curl -fsS -o /dev/null http://localhost:8080/app/index.html
echo "    /app/index.html -> 200 OK"

echo "==> verify passed"
