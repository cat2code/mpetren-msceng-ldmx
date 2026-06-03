#!/usr/bin/env bash
#SBATCH --job-name=ldmx_overlay
#SBATCH --output=logs/overlay_%j.out
#SBATCH --error=logs/overlay_%j.err
#SBATCH --time=04:00:00
#SBATCH --cpus-per-task=1
#SBATCH --mem=4G

set -euo pipefail

mkdir -p logs

echo "Running on host: $(hostname)"
echo "Started at: $(date)"
echo

./run_one_overlay.sh "$@"

echo
echo "Finished at: $(date)"