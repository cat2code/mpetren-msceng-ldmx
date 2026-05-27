# Sharding everything!!!!

cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/preprocess_production_5M_001_sharded.sbatch

#


send req to cosmos

scp requirements.txt eliotmp@cosmos.lunarc.lu.se:/home/eliotmp/eliot_project/



send plot to my comp

scp eliotmp@cosmos.lunarc.lu.se:/home/eliotmp/eliot_project/event_count_histogram.png ~/Downloads/.



Start something in the background

Running right now: 3096125

nohup python ~/eliot_project/inspect_event_counts.py > ~/eliot_project/inspect_event_counts.log 2>&1 &



Watch progress

tail -f ~/eliot_project/inspect_event_counts.log

Exit: Ctrl + C



Check if still running

ps -u $USER | grep inspect_event_counts

or

pgrep -af inspect_event_counts.py




Kill if needed:

kill PROCESS_ID

## Tensorize production_5M_001 into ML-ready shards

The tensorization batch job runs independently after disconnecting from SSH.
These Slurm scripts load `GCCcore/13.2.0` and `Python/3.11.5`, then activate
`mpetren-msceng-ldmx/.venv/` inside the batch job. The virtual environment
must already contain the requirements before submitting.

First run a small preflight job. It converts 100 events from one ROOT file
for each of `2e` and `3e`, writing to a separate smoke output directory:

```bash
cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/smoke_production_5M_001_sharded.sbatch
```

For a returned smoke job ID such as `1234567`, follow it with:

```bash
tail -F tensorize_production_5M_001_smoke_1234567.out tensorize_production_5M_001_smoke_1234567.err
squeue -j 1234567
sacct -j 1234567 --format=JobID,JobName,State,Elapsed,ExitCode,MaxRSS
```

The smoke output is stored below
`mpetren-msceng-ldmx/mldmx/data/processed/production_5M_001_sharded_smoke/`
and does not need to be deleted before the full job.

Before the full dataset, measure realistic shard memory use by tensorizing one
complete ROOT file from each class. Unlike the 100-event smoke run, this
preflight builds full approximately 10,000-event shards in memory:

```bash
cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/preflight_full_shards_production_5M_001.sbatch
```

For a returned preflight job ID such as `1234568`, follow it with:

```bash
tail -F tensorize_production_5M_001_full_shard_check_1234568.out tensorize_production_5M_001_full_shard_check_1234568.err
sacct -j 1234568 --format=JobID,JobName,State,Elapsed,ExitCode,MaxRSS
```

The full-shard preflight output is separate from production and can remain in
place: `mldmx/data/processed/production_5M_001_full_shard_preflight/`.

After the full-shard preflight completes within the `32G` request, submit the
complete dataset job:

```bash
cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch mpetren-msceng-ldmx/mldmx/scripts/slurm/preprocess_production_5M_001_sharded.sbatch
```

Record the job ID printed by `sbatch`, for example `Submitted batch job 1234567`.
The job writes logs in the current project area:

```bash
tail -F tensorize_production_5M_001_1234567.out tensorize_production_5M_001_1234567.err
squeue -j 1234567
sacct -j 1234567 --format=JobID,JobName,State,Elapsed,ExitCode,MaxRSS
```

The Python progress messages report each source `.root` file as its `.pt`
shard is written. Re-submitting after interruption resumes valid existing
shards because the job uses `--skip-existing`. If a ROOT file is unreadable
or cannot be tensorized, the production job records it under `skipped_sources`
in that class's `index.json`, logs the error, and continues with later files.

If a failed run already completed an indexed prefix, it can skip reopening
those existing shard payloads. For example, if `2e` completed through
`events_184.root` and failed at `events_185.root`, submit:

```bash
cd /projects/hep/fs9/shared/ldmx/users/eliotmp
sbatch --export=ALL,RESUME_2E_FROM_ROOT_INDEX=185 \
  mpetren-msceng-ldmx/mldmx/scripts/slurm/preprocess_production_5M_001_sharded.sbatch
```

Use `RESUME_3E_FROM_ROOT_INDEX` separately only if a later run has an existing
indexed prefix in the `3e` output. These values are 1-based ROOT-file positions.
