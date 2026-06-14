from pathlib import Path

DATA_DIR = Path("./data")
VIDEO_DIR = DATA_DIR / "videos"
FRAMES_DIR = DATA_DIR / "frames"
SCENES_DIR = DATA_DIR / "scenes"
SUBTITLES_DIR = DATA_DIR / "subtitles"
EMB_DIR = DATA_DIR / "embeddings"

CLIP_MODEL_NAME = 'hf-hub:timm/ViT-B-32-SigLIP2-256'
DIM_SIZE = 768
BATCH_SIZE = 64

video_ext = ["*.mp4", "*.mkv", "*.avi", "*.mov", "*.webm", "*.flv"]