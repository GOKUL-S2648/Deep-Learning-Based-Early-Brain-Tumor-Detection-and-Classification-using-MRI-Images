"""
Brain Tumor Classification — CNN Training Script
=================================================
Classes : glioma | meningioma | notumor | pituitary

Usage:
    python train.py                        # default 30 epochs
    python train.py --epochs 50 --lr 1e-3

Outputs (inside dataset/):
    checkpoints/best_model.pth     — best checkpoint by val accuracy
    logs/training_log.csv          — per-epoch loss & accuracy
    logs/confusion_matrix.png      — confusion matrix on hold-out test set
    logs/test_metrics.json         — accuracy / precision / recall / F1
"""

import os
import csv
import json
import time
import argparse
from pathlib import Path
from collections import Counter

import numpy as np
import matplotlib
matplotlib.use("Agg")          # headless backend — no display required
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)

# ──────────────────────────────────────────────
# Paths (all relative to this script's location)
# ──────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
TRAIN_DIR  = BASE_DIR / "Training"
TEST_DIR   = BASE_DIR / "Testing"
CKPT_DIR   = BASE_DIR / "checkpoints"
LOG_DIR    = BASE_DIR / "logs"

CKPT_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

CLASSES    = ["glioma", "meningioma", "notumor", "pituitary"]
NUM_CLASSES = len(CLASSES)

# ──────────────────────────────────────────────
# Hyper-parameters (overrideable via CLI)
# ──────────────────────────────────────────────
DEFAULT_EPOCHS    = 30
DEFAULT_LR        = 1e-3
DEFAULT_BATCH     = 32
DEFAULT_IMG_SIZE  = 224
DEFAULT_VAL_SPLIT = 0.20      # 20 % of Training set → validation
DEFAULT_SEED      = 42


# ═══════════════════════════════════════════════
# 1. CNN Model
# ═══════════════════════════════════════════════
class BrainTumorCNN(nn.Module):
    """
    4-block convolutional network followed by two fully-connected layers.

    Block pattern:
        Conv2d → BatchNorm2d → ReLU → MaxPool2d
    """

    def __init__(self, num_classes: int = 4):
        super().__init__()

        def conv_block(in_ch, out_ch):
            return nn.Sequential(
                nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
            )

        self.features = nn.Sequential(
            conv_block(3,   32),   # 224 → 112
            conv_block(32,  64),   # 112 →  56
            conv_block(64,  128),  #  56 →  28
            conv_block(128, 256),  #  28 →  14
        )
        self.pool = nn.AdaptiveAvgPool2d((1, 1))  # → 1×1
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.pool(x)
        x = self.classifier(x)
        return x


# ═══════════════════════════════════════════════
# 2. Data helpers
# ═══════════════════════════════════════════════
def build_transforms(img_size: int):
    train_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    return train_tf, val_tf


def print_class_counts(dataset, title: str):
    """Print a neat per-class image count table."""
    labels = [s[1] for s in dataset.samples]
    counts = Counter(labels)
    print(f"\n{'─'*40}")
    print(f"  {title}")
    print(f"{'─'*40}")
    total = 0
    for idx, cls in enumerate(dataset.classes):
        c = counts[idx]
        total += c
        print(f"  {cls:<15}  {c:>5} images")
    print(f"{'─'*40}")
    print(f"  {'TOTAL':<15}  {total:>5} images")
    print(f"{'─'*40}\n")


# ═══════════════════════════════════════════════
# 3. Training / validation loop
# ═══════════════════════════════════════════════
def run_epoch(model, loader, criterion, optimizer, device, phase="train"):
    is_train = (phase == "train")
    model.train(is_train)

    running_loss, correct, total = 0.0, 0, 0
    with torch.set_grad_enabled(is_train):
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            if is_train:
                optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            if is_train:
                loss.backward()
                optimizer.step()
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total   += labels.size(0)

    epoch_loss = running_loss / total
    epoch_acc  = correct / total
    return epoch_loss, epoch_acc


# ═══════════════════════════════════════════════
# 4. Evaluation on test set
# ═══════════════════════════════════════════════
def evaluate_test_set(model, loader, device, class_names):
    model.eval()
    all_preds, all_labels = [], []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    all_preds  = np.array(all_preds)
    all_labels = np.array(all_labels)
    return all_labels, all_preds


# ═══════════════════════════════════════════════
# 5. Plotting helpers
# ═══════════════════════════════════════════════
def save_confusion_matrix(labels, preds, class_names, save_path):
    cm = confusion_matrix(labels, preds)
    fig, ax = plt.subplots(figsize=(8, 7))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
        linewidths=0.5,
        ax=ax,
    )
    ax.set_xlabel("Predicted Label", fontsize=12)
    ax.set_ylabel("True Label", fontsize=12)
    ax.set_title("Confusion Matrix — Test Set", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Confusion matrix saved → {save_path}")


def save_training_curves(history, save_path):
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Loss
    axes[0].plot(epochs, history["train_loss"], label="Train", marker="o", markersize=3)
    axes[0].plot(epochs, history["val_loss"],   label="Val",   marker="s", markersize=3)
    axes[0].set_title("Loss per Epoch")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Accuracy
    axes[1].plot(epochs, history["train_acc"], label="Train", marker="o", markersize=3)
    axes[1].plot(epochs, history["val_acc"],   label="Val",   marker="s", markersize=3)
    axes[1].set_title("Accuracy per Epoch")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].yaxis.set_major_formatter(mticker.PercentFormatter(xmax=1.0))
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.suptitle("Brain Tumor CNN — Training Curves", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Training curves saved  → {save_path}")


# ═══════════════════════════════════════════════
# 6. Main
# ═══════════════════════════════════════════════
def parse_args():
    parser = argparse.ArgumentParser(description="Brain Tumor CNN Trainer")
    parser.add_argument("--epochs",    type=int,   default=DEFAULT_EPOCHS)
    parser.add_argument("--lr",        type=float, default=DEFAULT_LR)
    parser.add_argument("--batch",     type=int,   default=DEFAULT_BATCH)
    parser.add_argument("--img_size",  type=int,   default=DEFAULT_IMG_SIZE)
    parser.add_argument("--val_split", type=float, default=DEFAULT_VAL_SPLIT)
    parser.add_argument("--seed",      type=int,   default=DEFAULT_SEED)
    return parser.parse_args()


def main():
    args   = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    print("\n" + "═"*50)
    print("  Brain Tumor Classification — CNN Trainer")
    print("═"*50)
    print(f"  Device      : {device}")
    print(f"  Epochs      : {args.epochs}")
    print(f"  Batch size  : {args.batch}")
    print(f"  LR          : {args.lr}")
    print(f"  Image size  : {args.img_size}×{args.img_size}")
    print(f"  Val split   : {int(args.val_split*100)} %")

    # ── Transforms ──────────────────────────────
    train_tf, val_tf = build_transforms(args.img_size)

    # ── Full training dataset (for class-count inspection) ──
    full_train_ds = datasets.ImageFolder(str(TRAIN_DIR), transform=train_tf)
    print_class_counts(full_train_ds, "Training Set — Class Distribution")

    # ── Train / val split ───────────────────────
    n_total = len(full_train_ds)
    n_val   = int(n_total * args.val_split)
    n_train = n_total - n_val
    train_subset, val_subset = random_split(
        full_train_ds,
        [n_train, n_val],
        generator=torch.Generator().manual_seed(args.seed),
    )
    # Apply validation (no-augmentation) transforms to val subset
    val_subset.dataset = datasets.ImageFolder(str(TRAIN_DIR), transform=val_tf)

    print(f"  Train samples : {n_train}   |   Val samples : {n_val}")

    # ── Test dataset (NEVER used for training) ──
    test_ds = datasets.ImageFolder(str(TEST_DIR), transform=val_tf)

    # Print test set counts
    class_names = full_train_ds.classes
    test_labels_raw = [s[1] for s in test_ds.samples]
    test_counts = Counter(test_labels_raw)
    print(f"\n{'─'*40}")
    print(f"  Testing Set — Class Distribution")
    print(f"{'─'*40}")
    total_test = 0
    for idx, cls in enumerate(class_names):
        c = test_counts[idx]
        total_test += c
        print(f"  {cls:<15}  {c:>5} images")
    print(f"{'─'*40}")
    print(f"  {'TOTAL':<15}  {total_test:>5} images")
    print(f"{'─'*40}\n")

    # ── DataLoaders ─────────────────────────────
    num_workers = min(4, os.cpu_count() or 1)
    train_loader = DataLoader(train_subset, batch_size=args.batch,
                              shuffle=True,  num_workers=num_workers,
                              pin_memory=True)
    val_loader   = DataLoader(val_subset,   batch_size=args.batch,
                              shuffle=False, num_workers=num_workers,
                              pin_memory=True)
    test_loader  = DataLoader(test_ds,      batch_size=args.batch,
                              shuffle=False, num_workers=num_workers,
                              pin_memory=True)

    # ── Model / loss / optimiser ─────────────────
    model     = BrainTumorCNN(num_classes=NUM_CLASSES).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    print(f"  Model params  : {sum(p.numel() for p in model.parameters()):,}")

    # ── CSV log header ───────────────────────────
    csv_path = LOG_DIR / "training_log.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "epoch", "train_loss", "train_acc",
            "val_loss",   "val_acc",
            "lr", "epoch_time_s",
        ])

    # ── Training loop ────────────────────────────
    best_val_acc = 0.0
    history = {k: [] for k in ("train_loss", "train_acc", "val_loss", "val_acc")}

    print("\n" + "─"*72)
    print(f"{'Epoch':>6}  {'TrLoss':>8}  {'TrAcc':>7}  "
          f"{'VlLoss':>8}  {'VlAcc':>7}  {'LR':>9}  {'Time':>8}")
    print("─"*72)

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()

        tr_loss, tr_acc = run_epoch(model, train_loader, criterion,
                                    optimizer, device, "train")
        vl_loss, vl_acc = run_epoch(model, val_loader,   criterion,
                                    None,      device, "val")
        scheduler.step()

        elapsed = time.time() - t0
        cur_lr  = optimizer.param_groups[0]["lr"]

        history["train_loss"].append(tr_loss)
        history["train_acc"].append(tr_acc)
        history["val_loss"].append(vl_loss)
        history["val_acc"].append(vl_acc)

        # Save CSV row
        with open(csv_path, "a", newline="") as f:
            csv.writer(f).writerow([
                epoch,
                f"{tr_loss:.4f}", f"{tr_acc:.4f}",
                f"{vl_loss:.4f}", f"{vl_acc:.4f}",
                f"{cur_lr:.6f}", f"{elapsed:.1f}",
            ])

        # Checkpoint on improvement
        ckpt_tag = ""
        if vl_acc > best_val_acc:
            best_val_acc = vl_acc
            torch.save({
                "epoch":       epoch,
                "model_state": model.state_dict(),
                "optimizer":   optimizer.state_dict(),
                "val_acc":     vl_acc,
                "classes":     class_names,
            }, CKPT_DIR / "best_model.pth")
            ckpt_tag = "  ← SAVED"

        print(f"{epoch:>6}  {tr_loss:>8.4f}  {tr_acc:>6.2%}  "
              f"{vl_loss:>8.4f}  {vl_acc:>6.2%}  {cur_lr:>9.6f}  "
              f"{elapsed:>6.1f}s{ckpt_tag}")

    print("─"*72)
    print(f"\n  Best val accuracy : {best_val_acc:.2%}")
    print(f"  Training log      : {csv_path}")

    # ── Save training curves ─────────────────────
    save_training_curves(history, LOG_DIR / "training_curves.png")

    # ── Evaluate on test set (using best checkpoint) ──
    print("\n" + "═"*50)
    print("  Evaluating on HOLD-OUT TEST SET")
    print("═"*50)

    ckpt = torch.load(CKPT_DIR / "best_model.pth", map_location=device)
    model.load_state_dict(ckpt["model_state"])
    print(f"  Loaded checkpoint from epoch {ckpt['epoch']} "
          f"(val acc {ckpt['val_acc']:.2%})")

    true_labels, pred_labels = evaluate_test_set(model, test_loader, device, class_names)

    # Metrics
    acc  = accuracy_score(true_labels, pred_labels)
    prec = precision_score(true_labels, pred_labels, average=None, zero_division=0)
    rec  = recall_score(true_labels, pred_labels,    average=None, zero_division=0)
    f1   = f1_score(true_labels, pred_labels,        average=None, zero_division=0)

    macro_prec = precision_score(true_labels, pred_labels, average="macro", zero_division=0)
    macro_rec  = recall_score(true_labels, pred_labels,    average="macro", zero_division=0)
    macro_f1   = f1_score(true_labels, pred_labels,        average="macro", zero_division=0)

    # Print per-class metrics
    print(f"\n  Overall Test Accuracy : {acc:.2%}")
    print(f"\n  {'Class':<15} {'Precision':>10} {'Recall':>10} {'F1-Score':>10}")
    print(f"  {'─'*47}")
    for i, cls in enumerate(class_names):
        print(f"  {cls:<15} {prec[i]:>9.2%} {rec[i]:>9.2%} {f1[i]:>9.2%}")
    print(f"  {'─'*47}")
    print(f"  {'Macro Avg':<15} {macro_prec:>9.2%} {macro_rec:>9.2%} {macro_f1:>9.2%}")

    # Full sklearn report
    print("\n  Classification Report:\n")
    print(classification_report(true_labels, pred_labels,
                                target_names=class_names, digits=4))

    # Save confusion matrix
    save_confusion_matrix(
        true_labels, pred_labels, class_names,
        LOG_DIR / "confusion_matrix.png"
    )

    # Save JSON metrics
    metrics = {
        "overall_accuracy": round(float(acc), 6),
        "macro_precision":  round(float(macro_prec), 6),
        "macro_recall":     round(float(macro_rec),  6),
        "macro_f1":         round(float(macro_f1),   6),
        "per_class": {
            cls: {
                "precision": round(float(prec[i]), 6),
                "recall":    round(float(rec[i]),  6),
                "f1_score":  round(float(f1[i]),   6),
            }
            for i, cls in enumerate(class_names)
        },
        "checkpoint_epoch":   int(ckpt["epoch"]),
        "best_val_acc":       round(float(ckpt["val_acc"]), 6),
        "num_test_samples":   int(len(true_labels)),
        "num_train_samples":  n_train,
        "num_val_samples":    n_val,
        "epochs_trained":     args.epochs,
        "batch_size":         args.batch,
        "learning_rate":      args.lr,
        "image_size":         args.img_size,
    }
    metrics_path = LOG_DIR / "test_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=4)
    print(f"  Test metrics saved     → {metrics_path}")

    print("\n" + "═"*50)
    print("  All done!")
    print(f"  Checkpoint : {CKPT_DIR / 'best_model.pth'}")
    print(f"  Logs       : {LOG_DIR}")
    print("═"*50 + "\n")


if __name__ == "__main__":
    main()
