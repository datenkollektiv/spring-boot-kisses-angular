#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

REPORT="build/reports/dependency-check-report.html"

./gradlew dependencyCheckAnalyze

echo ""
echo "=== OWASP Dependency Check Summary ==="
echo ""
echo "Report: ${REPORT}"
echo ""

if [[ ! -f "${REPORT}" ]]; then
  echo "No report generated."
  exit 1
fi

cves=$(grep -o 'CVE-[0-9]*-[0-9]*' "${REPORT}" | sort -u)

if [[ -n "${cves}" ]]; then
  printf '%s\n' "${cves}" | sed 's/^/  - /'
  vuln_count=$(printf '%s\n' "${cves}" | wc -l | tr -d ' ')
else
  vuln_count=0
fi

echo ""
echo "Unique CVEs: ${vuln_count}"

if [[ "${vuln_count}" -gt 0 ]]; then
  exit 1
fi
