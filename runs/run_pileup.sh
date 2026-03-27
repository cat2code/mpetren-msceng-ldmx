#!/usr/bin/env bash
# Run the LDMX overlay workflow without modifying the Python generator/config scripts.
# Usage:
#   ./run_pileup.sh <MAIN_EVENTS> [PILEUP_EVENTS]
#
# What it does:
# - Chooses separate target counts for main and pileup production.
# - Computes the required LDMX_NUM_EVENTS values expected by each script.
# - Runs gen_main.py and gen_pileup.py before config.py.
# - Stores outputs in a uniquely indexed directory:
#     overlay_main<MAIN>_pileup<PILEUP>_<IDX>
#
# Example:
#   ./run_pileup.sh 1000 2000
#
# Default behavior:
#   If PILEUP_EVENTS is omitted → pileup = 2 × main.

set -euo pipefail

MAIN_EVENTS="${1:-1000}"
PILEUP_EVENTS="${2:-$((2 * MAIN_EVENTS))}"
RUN_NUMBER="${LDMX_RUN_NUMBER:-13}"

if ! [[ "${MAIN_EVENTS}" =~ ^[0-9]+$ ]] || [[ "${MAIN_EVENTS}" -lt 1 ]]; then
    echo "Error: MAIN_EVENTS must be a positive integer." >&2
    exit 1
fi

if ! [[ "${PILEUP_EVENTS}" =~ ^[0-9]+$ ]] || [[ "${PILEUP_EVENTS}" -lt 1 ]]; then
    echo "Error: PILEUP_EVENTS must be a positive integer." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNS_DIR="${SCRIPT_DIR}"
WORK_DIR="${RUNS_DIR}/it_pileup"

GEN_MAIN="${WORK_DIR}/gen_main.py"
GEN_PILEUP="${WORK_DIR}/gen_pileup.py"
CONFIG_PY="${WORK_DIR}/config.py"

if [[ ! -d "${WORK_DIR}" ]]; then
    echo "Error: could not find working directory: ${WORK_DIR}" >&2
    exit 1
fi

if [[ ! -f "${GEN_MAIN}" || ! -f "${GEN_PILEUP}" || ! -f "${CONFIG_PY}" ]]; then
    echo "Error: expected gen_main.py, gen_pileup.py and config.py inside ${WORK_DIR}" >&2
    exit 1
fi

# gen_main.py and config.py use:
#   p.max_events = int(os.environ['LDMX_NUM_EVENTS']) // 2
# so to get MAIN_EVENTS actual events:
MAIN_ENV_NUM_EVENTS=$(( 2 * MAIN_EVENTS ))

# gen_pileup.py uses:
#   p.max_events = int(int(os.environ['LDMX_NUM_EVENTS'])*0.95) // 2
# We choose the smallest integer N such that:
#   int(int(N)*0.95) // 2 = PILEUP_EVENTS
# Since int(N*0.95) = floor(19N/20), one valid inverse is:
PILEUP_ENV_NUM_EVENTS=$(( (40 * PILEUP_EVENTS + 18) / 19 ))

# Sanity check the arithmetic in shell terms
ACTUAL_MAIN_EVENTS=$(( MAIN_ENV_NUM_EVENTS / 2 ))
ACTUAL_PILEUP_EVENTS=$(( ((19 * PILEUP_ENV_NUM_EVENTS) / 20) / 2 ))

idx=0
while :; do
    OUTDIR="${RUNS_DIR}/overlay_main${MAIN_EVENTS}_pileup${PILEUP_EVENTS}_$(printf "%02d" "${idx}")"
    if [[ ! -e "${OUTDIR}" ]]; then
        break
    fi
    idx=$((idx + 1))
done
mkdir -p "${OUTDIR}"

run_fire() {
    local pyfile="$1"

    if command -v fire >/dev/null 2>&1; then
        fire "${pyfile}"
    elif command -v denv >/dev/null 2>&1; then
        denv fire "${pyfile}"
    elif command -v just >/dev/null 2>&1; then
        just fire "${pyfile}"
    else
        echo "Error: could not find a way to run 'fire'." >&2
        echo "Inside devcontainer, 'fire' should usually exist directly." >&2
        echo "Outside devcontainer, this script also tries 'denv fire' and 'just fire'." >&2
        exit 1
    fi
}

run_step() {
    local num_events="$1"
    local pyfile="$2"

    export LDMX_RUN_NUMBER="${RUN_NUMBER}"
    export LDMX_NUM_EVENTS="${num_events}"
    run_fire "${pyfile}"
}

rm -f \
    "${WORK_DIR}/ecal_pn.root" \
    "${WORK_DIR}/pileup.root" \
    "${WORK_DIR}/events.root" \
    "${WORK_DIR}/hist.root"

echo "Run number              : ${RUN_NUMBER}"
echo "Target main events      : ${MAIN_EVENTS}"
echo "Target pileup events    : ${PILEUP_EVENTS}"
echo "Main env LDMX_NUM_EVENTS: ${MAIN_ENV_NUM_EVENTS}"
echo "Pileup env LDMX_NUM_EVENTS: ${PILEUP_ENV_NUM_EVENTS}"
echo "Computed main events    : ${ACTUAL_MAIN_EVENTS}"
echo "Computed pileup events  : ${ACTUAL_PILEUP_EVENTS}"
echo "Output directory        : ${OUTDIR}"
echo

cd "${WORK_DIR}"

# Must run before config.py; order between these two does not matter
run_step "${MAIN_ENV_NUM_EVENTS}" gen_main.py
run_step "${PILEUP_ENV_NUM_EVENTS}" gen_pileup.py

if [[ ! -f "${WORK_DIR}/ecal_pn.root" ]]; then
    echo "Error: gen_main.py did not produce ecal_pn.root" >&2
    exit 1
fi

if [[ ! -f "${WORK_DIR}/pileup.root" ]]; then
    echo "Error: gen_pileup.py did not produce pileup.root" >&2
    exit 1
fi

run_step "${MAIN_ENV_NUM_EVENTS}" config.py

if [[ ! -f "${WORK_DIR}/events.root" ]]; then
    echo "Error: config.py did not produce events.root" >&2
    exit 1
fi

if [[ ! -f "${WORK_DIR}/hist.root" ]]; then
    echo "Error: config.py did not produce hist.root" >&2
    exit 1
fi

mv "${WORK_DIR}/ecal_pn.root" "${OUTDIR}/ecal_pn.root"
mv "${WORK_DIR}/pileup.root"  "${OUTDIR}/pileup.root"
mv "${WORK_DIR}/events.root"  "${OUTDIR}/events.root"
mv "${WORK_DIR}/hist.root"    "${OUTDIR}/hist.root"

echo
echo "Done. Files written to:"
echo "  ${OUTDIR}"
echo
ls -lh "${OUTDIR}"