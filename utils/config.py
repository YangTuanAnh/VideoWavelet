from pathlib import Path

DATA_DIR = Path("./data")
VIDEO_DIR = DATA_DIR / "videos"
FRAMES_DIR = DATA_DIR / "frames"
SCENES_DIR = DATA_DIR / "scenes"
SUBTITLES_DIR = DATA_DIR / "subtitles"
EMB_DIR = DATA_DIR / "embeddings"

CLIP_MODEL_NAME = 'hf-hub:laion/CLIP-ViT-B-32-laion2B-s34B-b79K'
DIM_SIZE = 512
BATCH_SIZE = 64

video_ext = ["*.mp4", "*.mkv", "*.avi", "*.mov", "*.webm", "*.flv"]