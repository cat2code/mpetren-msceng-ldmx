# Training Run Overview

## Run
- Output directory: `mldmx/outputs/hit_classifier_baseline/codex_io_sharded_cache_smoke`
- Created UTC: `2026-06-10T10:45:06.776691+00:00`
- Script: `/Users/eliotmontesinopetren/Documents/exjobb_kod/mpetren-msceng-ldmx/mldmx/scripts/train_hit_classifier_baseline.py`
- Python: `3.13.7 (main, Aug 14 2025, 11:12:11) [Clang 17.0.0 (clang-1700.3.19.1)]`
- Platform: `macOS-26.5.1-arm64-arm-64bit-Mach-O`
- Torch: `2.11.0`

## Model
- Requested model: `ECalTransformer`
- Class: `mldmx.models.ecal_transformer.ECalTransformer`
- Input dimension: `4`
- Output dimension: `3`
- Trainable parameters: `739`
- Total parameters: `739`

### Constructor kwargs
```json
{
  "d_model": 8,
  "dim_feedforward": 16,
  "dropout": 0.0,
  "in_dim": 4,
  "nhead": 2,
  "num_layers": 1,
  "out_dim": 3
}
```

### Architecture
```text
ECalTransformer(
  (input_proj): Sequential(
    (0): Linear(in_features=4, out_features=8, bias=True)
    (1): ReLU()
    (2): Linear(in_features=8, out_features=8, bias=True)
  )
  (encoder): TransformerEncoder(
    (layers): ModuleList(
      (0): TransformerEncoderLayer(
        (self_attn): MultiheadAttention(
          (out_proj): NonDynamicallyQuantizableLinear(in_features=8, out_features=8, bias=True)
        )
        (linear1): Linear(in_features=8, out_features=16, bias=True)
        (dropout): Dropout(p=0.0, inplace=False)
        (linear2): Linear(in_features=16, out_features=8, bias=True)
        (norm1): LayerNorm((8,), eps=1e-05, elementwise_affine=True)
        (norm2): LayerNorm((8,), eps=1e-05, elementwise_affine=True)
        (dropout1): Dropout(p=0.0, inplace=False)
        (dropout2): Dropout(p=0.0, inplace=False)
      )
    )
  )
  (head): Linear(in_features=8, out_features=3, bias=True)
)
```

## Training
- Start epoch: `0`
- Requested epochs: `1`
- Remaining epochs: `1`
- Device requested: `cpu`
- Device resolved: `cpu`
- Seed: `7`
- Batch size: `4`
- Learning rate: `0.001`
- Weight decay: `0.0`
- Gradient clip: `1.0`
- Checkpoint every: `1`
- Resume checkpoint: `None`

### Optimizer
- Class: `torch.optim.adamw.AdamW`
```json
[
  {
    "amsgrad": false,
    "betas": [
      0.9,
      0.999
    ],
    "capturable": false,
    "decoupled_weight_decay": true,
    "differentiable": false,
    "eps": 1e-08,
    "foreach": null,
    "fused": null,
    "lr": 0.001,
    "maximize": false,
    "weight_decay": 0.0
  }
]
```

## Data
- Resolved data dir: `mldmx/outputs/hit_classifier_baseline/codex_io_sharded_cache_fixture`
- Loaded events: `10`
- Split sizes: `{"test": 1, "train": 8, "val": 1}`
- Shard cache: `{"cache_dir": "mldmx/outputs/hit_classifier_baseline/codex_io_sharded_cache_fixture", "cache_evictions": 6, "cache_hits": 22, "cache_misses": 7, "kind": "sharded", "loaded_shard_paths": ["shards/shard_000001.pt"], "loaded_shards": [0], "num_events": 10, "num_shards": 2, "shard_cache_size": 1, "shard_event_counts": [5, 5]}`

### Class counts
```json
{
  "test": {
    "1": 130,
    "2": 111,
    "3": 150
  },
  "train": {
    "1": 1005,
    "2": 992,
    "3": 996
  },
  "val": {
    "1": 119,
    "2": 128,
    "3": 105
  }
}
```

### Target order counts
```json
{
  "test": {
    "(2, 3, 1)": 1
  },
  "train": {
    "(2, 1, 3)": 2,
    "(2, 3, 1)": 4,
    "(3, 1, 2)": 1,
    "(3, 2, 1)": 1
  },
  "val": {
    "(2, 3, 1)": 1
  }
}
```

## Preprocessing
- Target mode: `canonical-y`
- Valid labels: `[1, 2, 3]`
- Normalize features: `True`
- View function: `ecal_transformer_view`
- Training view function: `precomputed`
- Model-view cache: `{"enabled": true, "max_cache_events": 4, "policy": "lazy_lru"}`

### Feature normalization
```json
{
  "enabled": true,
  "first_continuous_col": 2,
  "mean": [
    -9.347044944763184,
    0.36740246415138245,
    387.3760986328125,
    58.180355072021484,
    0.17556452751159668,
    1.1446582078933716
  ],
  "std": [
    37.0863037109375,
    40.84479522705078,
    90.87516021728516,
    92.38426971435547,
    2.374910593032837,
    14.049565315246582
  ]
}
```

## Hyperparameters
| Name | Value |
| --- | --- |
| `model` | `ECalTransformer` |
| `events_per_class` | `10` |
| `max_events` | `10` |
| `data_root` | `/Users/eliotmontesinopetren/Documents/exjobb_kod/mpetren-msceng-ldmx/mldmx/data/ldmx_overlay_events_700k` |
| `processed_dir` | `mldmx/outputs/hit_classifier_baseline/codex_io_sharded_cache_fixture` |
| `processed_cache` | `None` |
| `processed_cache_root` | `None` |
| `processed_source` | `None` |
| `events_per_source` | `None` |
| `force_sharded_cache` | `False` |
| `allow_incomplete_sharded_cache` | `False` |
| `max_cache_root_files` | `None` |
| `max_events_per_root_file` | `None` |
| `shard_cache_size` | `1` |
| `output_root` | `mldmx/outputs/hit_classifier_baseline` |
| `run_name` | `codex_io_sharded_cache_smoke` |
| `epochs` | `1` |
| `batch_size` | `4` |
| `lr` | `0.001` |
| `weight_decay` | `0.0` |
| `seed` | `7` |
| `checkpoint_every` | `1` |
| `resume` | `None` |
| `device` | `cpu` |
| `valid_labels` | `[1, 2, 3]` |
| `target_mode` | `canonical-y` |
| `hidden_dim` | `8` |
| `num_layers` | `1` |
| `num_heads` | `2` |
| `dim_feedforward` | `16` |
| `dropout` | `0.0` |
| `space_dimensions` | `4` |
| `propagate_dimensions` | `32` |
| `k` | `16` |
| `grad_clip` | `1.0` |
| `no_normalize_features` | `False` |
| `cache_model_views` | `True` |
| `model_view_cache_size` | `4` |
| `allow_small_split` | `True` |
| `no_progress` | `True` |
| `num_ecal_plots` | `1` |
| `event_log_every` | `0` |
| `read_step_size` | `500` |
| `allow_fewer_events` | `False` |
| `output_dir` | `mldmx/outputs/hit_classifier_baseline` |

## Parameter Tensors
| Name | Shape | Numel | Trainable | Dtype |
| --- | ---: | ---: | --- | --- |
| `input_proj.0.weight` | `[8, 4]` | `32` | `True` | `torch.float32` |
| `input_proj.0.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `input_proj.2.weight` | `[8, 8]` | `64` | `True` | `torch.float32` |
| `input_proj.2.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.self_attn.in_proj_weight` | `[24, 8]` | `192` | `True` | `torch.float32` |
| `encoder.layers.0.self_attn.in_proj_bias` | `[24]` | `24` | `True` | `torch.float32` |
| `encoder.layers.0.self_attn.out_proj.weight` | `[8, 8]` | `64` | `True` | `torch.float32` |
| `encoder.layers.0.self_attn.out_proj.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.linear1.weight` | `[16, 8]` | `128` | `True` | `torch.float32` |
| `encoder.layers.0.linear1.bias` | `[16]` | `16` | `True` | `torch.float32` |
| `encoder.layers.0.linear2.weight` | `[8, 16]` | `128` | `True` | `torch.float32` |
| `encoder.layers.0.linear2.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.norm1.weight` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.norm1.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.norm2.weight` | `[8]` | `8` | `True` | `torch.float32` |
| `encoder.layers.0.norm2.bias` | `[8]` | `8` | `True` | `torch.float32` |
| `head.weight` | `[3, 8]` | `24` | `True` | `torch.float32` |
| `head.bias` | `[3]` | `3` | `True` | `torch.float32` |
