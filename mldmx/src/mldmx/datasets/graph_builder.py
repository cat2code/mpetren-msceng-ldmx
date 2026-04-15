'''
Builds graph connectivity from node positions.

This module provides utilities to construct edge indices for graph neural
networks. Given node coordinates (e.g. detector hit positions), it creates
a graph by connecting each node to its k nearest neighbors.

Input:
    pos : Tensor of shape [N, 3] containing node positions

Output:
    edge_index : Tensor of shape [2, E] defining graph edges

Notes:
- This module is geometry-only: it does not know about physics, labels,
  or datasets.
- It can be replaced by PyG utilities (e.g. knn_graph) later.
'''

import torch


def build_knn_graph(pos: torch.Tensor, k: int = 8) -> torch.Tensor:
    num_nodes = pos.size(0)

    if num_nodes < 2:
        return torch.empty((2, 0), dtype=torch.long)

    dist = torch.cdist(pos, pos)  # [N, N]
    knn = dist.topk(k=min(k + 1, num_nodes), largest=False).indices  # includes self

    edges = []
    for i in range(num_nodes):
        for j in knn[i]:
            j = j.item()
            if i != j:
                edges.append([i, j])

    if not edges:
        return torch.empty((2, 0), dtype=torch.long)

    return torch.tensor(edges, dtype=torch.long).t().contiguous()