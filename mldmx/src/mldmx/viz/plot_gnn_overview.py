from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import torch


def plot_event_graph(data, savepath: Path) -> None:
    pos = data.pos.detach().cpu()
    edge_index = data.edge_index.detach().cpu()
    x = data.x.detach().cpu()

    xcoord = pos[:, 0]
    zcoord = pos[:, 2]

    energy = x[:, 3].clamp(min=0.0)
    sizes = 10.0 + 120.0 * energy / (energy.max() + 1e-8)

    fig, ax = plt.subplots(figsize=(8, 6))

    for src, dst in edge_index.t():
        ax.plot(
            [xcoord[src], xcoord[dst]],
            [zcoord[src], zcoord[dst]],
            linewidth=0.5,
            alpha=0.25,
        )

    scatter = ax.scatter(
        xcoord,
        zcoord,
        s=sizes.numpy(),
        c=energy.numpy(),
        alpha=0.9,
    )

    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label("Node energy")

    label = int(data.y.item()) if hasattr(data, "y") and data.y is not None else -1
    ax.set_title(f"Tiny GNN input graph for one LDMX event (label={label})")
    ax.set_xlabel("x")
    ax.set_ylabel("z")
    ax.grid(True, alpha=0.3)

    savepath.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(savepath, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved graph figure to {savepath}")


def plot_training_curves(history, savepath: Path) -> None:
    train_losses = history["train_loss"]
    val_accs = history["val_acc"]
    epochs = range(1, len(train_losses) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    axes[0].plot(epochs, train_losses)
    axes[0].set_title("Training loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Cross-entropy loss")
    axes[0].grid(True, alpha=0.3)

    axes[1].plot(epochs, val_accs)
    axes[1].set_title("Validation accuracy")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].set_ylim(0.0, 1.0)
    axes[1].grid(True, alpha=0.3)

    savepath.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(savepath, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved training figure to {savepath}")

def plot_event_energy_map(data, savepath: Path) -> None:
    """
    Plot the same event in the x-z plane, with reconstructed energy shown by color.
    Assumes:
      - data.pos has shape [N, 3]
      - data.x[:, 3] is reconstructed energy
    """
    pos = data.pos.detach().cpu()
    x = data.x.detach().cpu()

    xcoord = pos[:, 0]
    zcoord = pos[:, 2]
    energy = x[:, 3].clamp(min=0.0)

    fig, ax = plt.subplots(figsize=(8, 6))

    scatter = ax.scatter(
        xcoord,
        zcoord,
        c=energy.numpy(),
        s=18,
        alpha=0.9,
    )

    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label("Reconstructed energy")

    label = int(data.y.item()) if hasattr(data, "y") and data.y is not None else -1
    ax.set_title(f"ECal hit map in x-z for one event (label={label})")
    ax.set_xlabel("x")
    ax.set_ylabel("z")
    ax.grid(True, alpha=0.3)

    savepath.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(savepath, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved energy-map figure to {savepath}")

def main():
    output_dir = Path("outputs/tiny_gnn")
    figures_dir = Path("figures/tiny_gnn")

    history_path = output_dir / "history.pt"
    graph_path = output_dir / "example_graph.pt"

    if not history_path.exists():
        raise FileNotFoundError(f"Could not find {history_path}. Run train_tiny_gnn.py first.")

    if not graph_path.exists():
        raise FileNotFoundError(f"Could not find {graph_path}. Run train_tiny_gnn.py first.")

    history = torch.load(history_path, map_location="cpu", weights_only=False)
    graph = torch.load(graph_path, map_location="cpu", weights_only=False)

    plot_event_graph(graph, figures_dir / "tiny_gnn_event_graph.png")
    plot_event_energy_map(graph, figures_dir / "tiny_gnn_event_energy_map_xz.png")
    plot_training_curves(history, figures_dir / "tiny_gnn_training_curves.png")


if __name__ == "__main__":
    main()