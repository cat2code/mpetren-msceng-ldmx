# Graph Neural Network-Based Reconstruction for LDMX under Pile-Up

This repository contains the MScEng thesis work of Eliot M. Petrén for the
Light Dark Matter eXperiment (LDMX) group at the Division of Particle and
Nuclear Physics, Lund University.

The project studies machine-learning reconstruction of overlapping electron
events in LDMX. The current pipeline combines ECal reconstructed hits with
TriggerPadTracks context and explores graph- and transformer-based models for
hit-origin assignment, fractional attribution, and event-level electron
counting under pile-up conditions.

This is an active research repository. Scripts, datasets, and model choices may
change as the thesis work develops.

## Repository Layout

| Path | Purpose |
| --- | --- |
| `mldmx/` | Installable Python package, runnable ML scripts, notebooks, trained artifacts, figures, and experiment outputs. |
| `runs/` | LDMX simulation and overlay run directories; `runs/it_pileup/` contains the current `ldmx-sw` configuration scripts. |
| `playground/` | Early notebooks and exploratory visualizations. |
| `to_send_to_cosmos_cluster/` | Files prepared for running simulation work on the Cosmos cluster. |
| `papers/` | Reference literature collected during the project. |
| `veckomote/` | Project and supervision meeting notes. |
| `external/` | Local upstream `ldmx-sw` checkouts, ignored by Git. |

## Current Workflow

The core development now lives in `mldmx/`:

1. Generate or overlay LDMX events with the `ldmx-sw` configurations in
   `runs/it_pileup/`.
2. Read ROOT event data with `uproot` and `awkward`.
3. Tensorize ECal hits and TriggerPadTracks information, optionally constructing
   graph edges and cached event tensors.
4. Train and evaluate reconstruction models implemented in
   `mldmx/src/mldmx/models/`.
5. Save checkpoints, metrics, event displays, and diagnostic plots under
   `mldmx/outputs/` and `mldmx/figures/`.

Implemented experiments include:

- Small GNN and transformer baselines for three-class ECal hit assignment.
- ECal plus TriggerPadTracks graph and transformer variants.
- An MLPF-lite-style model for hit-origin classification and fractional
  attribution.
- A slot-validity multi-task model for variable electron multiplicity.

## Setup

The LDMX simulation step uses the `ldmx-sw` environment and its Docker-based
workflow. The ML analysis code is run in a regular Python environment.

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pip install -e mldmx
```

The Python dependencies include PyTorch, PyTorch Geometric, ROOT-reading tools,
Jupyter, and plotting libraries. Large generated ROOT files and local
`ldmx-sw` checkouts are excluded through `.gitignore`.

## Running The ML Code

Commands below are intended to be run from the repository root after installing
`mldmx`. Supply paths to the locally generated ROOT datasets where indicated.

Check ROOT reading and tensor conversion:

```bash
python mldmx/scripts/root_to_tensor_smoke.py path/to/events.root --stop 5
```

Preprocess labelled ECal and TriggerPadTracks events into cached tensors:

```bash
python mldmx/scripts/preprocess_ecal_tpad_dataset.py \
  --root-file path/to/events.root \
  --output-dir mldmx/data/processed/ecal_tpad_3class
```

Run a quick forward/backward model check using existing processed smoke data:

```bash
python mldmx/scripts/smoke_ecal_tpad_slot_model.py --max-events 3 --device cpu
```

Train the MLPF-lite-style ECal/TriggerPadTracks model:

```bash
python mldmx/scripts/train_ecal_tpad_mlpf_lite_scaled.py \
  --data-dir path/to/events \
  --max-events 1000 \
  --epochs 1
```

Train the slot-validity model on two- and three-electron event directories:

```bash
python mldmx/scripts/train_ecal_tpad_slot_model.py \
  --data-root path/to/ldmx_overlay_events \
  --events-per-class 10 \
  --epochs 2 \
  --device cpu
```

For package structure and shorter notes about the ML directory, see
[`mldmx/README.md`](mldmx/README.md).

## License

This repository is licensed under the terms in [`LICENSE`](LICENSE).
