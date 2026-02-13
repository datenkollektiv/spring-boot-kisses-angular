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

grep -o 'CVE-[0-9]*-[0-9]*' "${REPORT}" \
  | sort -u \
  | while read -r cve; do
      echo "  - ${cve}"
    done

vuln_count=$(grep -o 'CVE-[0-9]*-[0-9]*' "${REPORT}" | sort -u | wc -l | tr -d ' ')
echo ""
echo "Unique CVEs: ${vuln_count}"

if [[ "${vuln_count}" -gt 0 ]]; then
  exit 1
fi
