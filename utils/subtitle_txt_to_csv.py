from .config import VIDEO_DIR, DATA_DIR, SUBTITLES_DIR, video_ext
import os
import re
from pathlib import Path
from tqdm import tqdm
import pandas as pd

if __name__ == "__main__":
    files = os.listdir(SUBTITLES_DIR)

    for file_path in tqdm(files):
        if not file_path.endswith(".txt"):
            continue
        stem = Path(file_path).stem

        data = []
        with open(SUBTITLES_DIR / file_path, "r", encoding="UTF-8") as f:
            for line in f:
                result = re.search(r"\[(\d+\.\d+)s - (\d+\.\d+)s\](.*)", line.rstrip())
                data.append(
                    {
                        "start_time": float(result.group(1)),
                        "end_time": float(result.group(2)),
                        "text": str(result.group(3)).strip(),
                    }
                )

        df = pd.DataFrame(data)
        subtitle_path = SUBTITLES_DIR / f"{stem}-Subtitles.csv"
        df.to_csv(subtitle_path, encoding="utf-8")

        os.remove(SUBTITLES_DIR / file_path)

    print("Done with subtitles!")
