from pathlib import Path

DATA_DIR = Path("./data")
VIDEO_DIR = DATA_DIR / "videos"
FRAMES_DIR = DATA_DIR / "frames"
SCENES_DIR = DATA_DIR / "scenes"
SUBTITLES_DIR = DATA_DIR / "subtitles"
EMB_DIR = DATA_DIR / "embeddings"

CLIP_MODEL_NAME = 'hf-hub:timm/ViT-B-32-SigLIP2-256'
VQA_MODEL_NAME = "gemini-3.5-flash"
VQA_TESTGEN_MODEL_NAME = "gemini-3.1-flash-lite"
DIM_SIZE = 768
BATCH_SIZE = 64

KIS_SEED = 42
VQA_SEED = 36
TRAKE_SEED = 67

video_ext = ["*.mp4", "*.mkv", "*.avi", "*.mov", "*.webm", "*.flv"]