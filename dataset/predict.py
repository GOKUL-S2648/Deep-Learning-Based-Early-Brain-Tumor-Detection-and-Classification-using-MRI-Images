"""
Brain Tumor Classification - Standalone Prediction Script
=========================================================
Usage:
    python predict.py --image path/to/brain_mri.jpg
    python predict.py --image path/to/brain_mri.jpg --checkpoint checkpoints/best_model.pth

Output:
    Predicted class, confidence score, and top-3 probabilities.
"""
import sys
import io
# Fix Windows console UTF-8 output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

# ──────────────────────────────────────────────
# Default checkpoint path (relative to this script)
# ──────────────────────────────────────────────
BASE_DIR     = Path(__file__).resolve().parent
DEFAULT_CKPT = BASE_DIR / "checkpoints" / "best_model.pth"

# ──────────────────────────────────────────────
# Model definition (must match train.py)
# ──────────────────────────────────────────────
class BrainTumorCNN(nn.Module):
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
            conv_block(3,   32),
            conv_block(32,  64),
            conv_block(64,  128),
            conv_block(128, 256),
        )
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
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


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def load_model(ckpt_path: Path, device: torch.device):
    """Load model weights and class list from checkpoint."""
    if not ckpt_path.exists():
        print(f"\n[ERROR] Checkpoint not found: {ckpt_path}")
        print("  Train the model first with:  python train.py")
        sys.exit(1)

    ckpt = torch.load(ckpt_path, map_location=device)
    class_names = ckpt.get("classes", ["glioma", "meningioma", "notumor", "pituitary"])
    num_classes  = len(class_names)

    model = BrainTumorCNN(num_classes=num_classes)
    model.load_state_dict(ckpt["model_state"])
    model.to(device)
    model.eval()

    print(f"  Checkpoint  : {ckpt_path}")
    print(f"  Trained at epoch {ckpt.get('epoch', '?')} "
          f"| Val accuracy {ckpt.get('val_acc', 0):.2%}")
    print(f"  Classes     : {class_names}")
    return model, class_names


def preprocess_image(img_path: Path, img_size: int = 224) -> torch.Tensor:
    """Load and preprocess a single image for inference."""
    tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    img = Image.open(img_path).convert("RGB")
    return tf(img).unsqueeze(0)   # add batch dimension


def predict(model, tensor: torch.Tensor, class_names: list, device: torch.device):
    """Run forward pass and return sorted (class, probability) pairs."""
    tensor = tensor.to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs  = F.softmax(logits, dim=1).squeeze(0)   # shape: (num_classes,)

    results = sorted(
        zip(class_names, probs.cpu().tolist()),
        key=lambda x: x[1],
        reverse=True,
    )
    return results   # [(class_name, prob), ...]


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser(description="Brain Tumor Classifier — Predict")
    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to brain MRI image (jpg / png / bmp)",
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=str(DEFAULT_CKPT),
        help=f"Path to model checkpoint (default: {DEFAULT_CKPT})",
    )
    parser.add_argument(
        "--img_size",
        type=int,
        default=224,
        help="Image resize dimension used during training (default: 224)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output inference result in structured JSON format",
    )
    return parser.parse_args()


def main():
    args      = parse_args()
    img_path  = Path(args.image)
    ckpt_path = Path(args.checkpoint)
    device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if not args.json:
        print("\n" + "="*50)
        print("  Brain Tumor Classifier - Prediction")
        print("="*50)
        print(f"  Device      : {device}")
        print(f"  Image       : {img_path}")

    # -- Validate image path
    if not img_path.exists():
        if args.json:
            import json
            print("__JSON_START__" + json.dumps({"error": f"Image not found: {img_path}"}) + "__JSON_END__")
        else:
            print(f"\n[ERROR] Image not found: {img_path}")
        sys.exit(1)

    # -- Load model
    model, class_names = load_model(ckpt_path, device)

    # -- Preprocess & predict
    tensor  = preprocess_image(img_path, args.img_size)
    results = predict(model, tensor, class_names, device)

    top_class, top_prob = results[0]

    if args.json:
        import json
        prob_dict = {cls: float(prob) for cls, prob in results}
        payload = {
            "prediction": top_class.lower(),
            "confidence": float(top_prob),
            "probabilities": prob_dict,
        }
        print("__JSON_START__" + json.dumps(payload) + "__JSON_END__")
        return

    # -- Print results
    print("\n" + "-"*50)
    print(f"  Prediction  : {top_class.upper()}")
    print(f"  Confidence  : {top_prob:.2%}")
    print("\n  Top-3 Probabilities:")
    print(f"  {'Rank':<6} {'Class':<15} {'Probability':>12}")
    print(f"  {'-'*35}")
    for rank, (cls, prob) in enumerate(results[:3], 1):
        bar = "#" * int(prob * 20)
        print(f"  {rank:<6} {cls:<15} {prob:>11.2%}  {bar}")
    print("-"*50 + "\n")


if __name__ == "__main__":
    main()
