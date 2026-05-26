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
Both Slurm scripts load `GCCcore/13.2.0` and `Python/3.11.5`, then activate
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

After the smoke job completes successfully, submit the full job:

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
shards because the job uses `--skip-existing`.
