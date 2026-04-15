'''
Defines a minimal Graph Neural Network for event-level classification.

This model performs:
    1. Message passing using GraphConv layers
    2. Node feature aggregation via global mean pooling
    3. Event-level classification using a linear head

Input:
    x           : Node features [total_nodes, in_dim]
    edge_index  : Graph connectivity [2, E]
    batch       : Batch vector mapping nodes to events

Output:
    logits      : Event-level predictions [batch_size, out_dim]

Notes:
- Designed as a minimal baseline for debugging the pipeline.
- Intended to overfit small datasets before scaling complexity.
'''

import torch
import torch.nn as nn
from torch_geometric.nn import GraphConv, global_mean_pool


class SimpleGNN(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int = 32, out_dim: int = 2):
        super().__init__()
        self.conv1 = GraphConv(in_dim, hidden_dim)
        self.conv2 = GraphConv(hidden_dim, hidden_dim)
        self.head = nn.Linear(hidden_dim, out_dim)

    def forward(self, x, edge_index, batch):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        x = global_mean_pool(x, batch)
        return self.head(x)