# Cosmos MLDMX Run Notes

Authoritative training guide:

```text
mpetren-msceng-ldmx/mldmx/docs/cosmos_training.md
```

## Normal Start

```bash
ssh eliotmp@cosmos.lunarc.lu.se
cd /projects/hep/fs9/shared/ldmx/users/eliotmp/mpetren-msceng-ldmx
git pull
source .venv/bin/activate
cd mldmx
python -m pip install -e .
mkdir -p outputs/slurm
```

The production ML-ready shard layout is expected to be:

```text
mldmx/data/processed/production_5M_001_sharded/
  2e/events/index.json
  2e/events/manifest.json
  2e/events/shards/
  3e/events/index.json
  3e/events/manifest.json
  3e/events/shards/
```

Training should normally use `--processed-cache-root
data/processed/production_5M_001_sharded`, not ROOT reading.

## GPU Validation

```bash
sbatch other/cosmos_validate_gpu.sbatch
```

This uses `gpua100i`, checks CUDA, and runs the five maintained-model common
pipeline validation.

## First Training Runs

1,000 total events, balanced across `2e` and `3e`:

```bash
sbatch --export=ALL,MODEL=ECalTpadTransformer,EVENTS_PER_SOURCE=500,EPOCHS=5,RUN_NAME=tpad_transformer_1k \
  other/cosmos_train_baseline.sbatch
```

10,000 total events:

```bash
sbatch --export=ALL,MODEL=ECalTpadTransformer,EVENTS_PER_SOURCE=5000,EPOCHS=10,RUN_NAME=tpad_transformer_10k \
  other/cosmos_train_baseline.sbatch
```

Advanced slot model, 1,000 total events:

```bash
sbatch --export=ALL,EVENTS_PER_SOURCE=500,EPOCHS=5,RUN_NAME=slot_1k \
  other/cosmos_train_slot.sbatch
```

`EVENTS_PER_SOURCE=N` means total events are `2*N` for the standard
`2e`+`3e` processed-cache root.

## Monitor

```bash
jobinfo -u $USER
squeue -j <jobid>
tail -F outputs/slurm/<job-name>_<jobid>.out
sacct -j <jobid> --format=JobID,JobName,State,Elapsed,ExitCode,MaxRSS
srun --jobid=<jobid> --pty nvidia-smi
```

Outputs are written under:

```text
mldmx/outputs/cosmos_baselines/<run-name>/
mldmx/outputs/cosmos_slot/<run-name>/
```

Resume with:

```bash
sbatch --export=ALL,RESUME=outputs/cosmos_baselines/<run-name>/checkpoints/latest.pt,RUN_NAME=<new-or-same-name> \
  other/cosmos_train_baseline.sbatch
```

## Tensorize Production Shards

The production tensorization jobs are separate from training. They should write
independent `2e/events` and `3e/events` caches so training can balance them
with `--processed-cache-root`.

Existing preprocessing Slurm entry points remain:

```bash
cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/smoke_production_5M_001_sharded.sbatch
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/preflight_full_shards_production_5M_001.sbatch
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/preprocess_production_5M_001_sharded.sbatch
```

Reruns should use `--skip-existing` or the script defaults that reuse valid
completed shards.
