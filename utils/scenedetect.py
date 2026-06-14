import os
import glob
import subprocess
from tqdm import tqdm
from .config import VIDEO_DIR, SCENES_DIR, FRAMES_DIR, video_ext

if __name__ == "__main__":
    files = []
    for ext in video_ext:
        files.extend(glob.glob(os.path.join(VIDEO_DIR, "**" , ext), recursive=True))
    for f in files:
        print("Processing:", f)

        subprocess.run([
            "scenedetect",
            "-i",
            f,
            "list-scenes",
            "-q",
            "-o", SCENES_DIR,
            "save-images",
            "-o", FRAMES_DIR,
            "-H", "448", "-W", "448",
            "-n", "1",
            "-f", "$VIDEO_NAME\Scene-$SCENE_NUMBER-$FRAME_NUMBER"
        ])

    print("Done with keyframes!")