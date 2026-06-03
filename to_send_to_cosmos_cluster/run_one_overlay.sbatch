#!/usr/bin/env bash

# chmod +x run_one_overlay.sh

set -euo pipefail

MAIN_FILE="$1"
PILEUP_FILE="$2"
OUT_DIR="$3"
RUN_NUMBER="$4"
MAX_OUTPUT_EVENTS="$5"
OVERLAY_MU="$6"

CONFIG_FILE="$HOME/eliot_project/overlay_variable_inputs.py"

mkdir -p "$OUT_DIR"

export LDMX_MAIN_FILE="$MAIN_FILE"
export LDMX_PILEUP_FILE="$PILEUP_FILE"
export LDMX_OUTPUT_FILE="$OUT_DIR/events.root"
export LDMX_HIST_FILE="$OUT_DIR/hist.root"

export LDMX_RUN_NUMBER="$RUN_NUMBER"
export LDMX_MAX_EVENTS="$MAX_OUTPUT_EVENTS"
export LDMX_OVERLAY_MU="$OVERLAY_MU"

echo "Running overlay job"
echo "MAIN_FILE        = $LDMX_MAIN_FILE"
echo "PILEUP_FILE      = $LDMX_PILEUP_FILE"
echo "OUTPUT_FILE      = $LDMX_OUTPUT_FILE"
echo "HIST_FILE        = $LDMX_HIST_FILE"
echo "RUN_NUMBER       = $LDMX_RUN_NUMBER"
echo "MAX_OUTPUT_EVENTS= $LDMX_MAX_EVENTS"
echo "OVERLAY_MU       = $LDMX_OVERLAY_MU"
echo

ldmx fire "$CONFIG_FILE"