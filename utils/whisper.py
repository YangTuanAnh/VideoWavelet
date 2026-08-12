import os
import glob
import subprocess
from pathlib import Path
from tqdm import tqdm
import pandas as pd

from faster_whisper import WhisperModel, BatchedInferencePipeline

from .config import VIDEO_DIR, DATA_DIR, SUBTITLES_DIR, video_ext

if __name__ == "__main__":
    files = []
    for ext in video_ext:
        files.extend(glob.glob(os.path.join(VIDEO_DIR, "**", ext), recursive=True))

    os.makedirs(SUBTITLES_DIR, exist_ok=True)

    model_size = "base"
    model = WhisperModel(model_size)
    batched_model = BatchedInferencePipeline(model=model)

    for video_path in tqdm(files):
        stem = Path(video_path).stem
        audio_path = DATA_DIR / "tmp.wav"

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                video_path,
                "-hide_banner",
                "-loglevel",
                "error",
                "-vn",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-acodec",
                "pcm_s16le",
                audio_path,
            ],
            check=True,
        )

        print("Transcribing:", video_path)
        segments, info = batched_model.transcribe(
            audio_path, beam_size=5, language="vi", batch_size=16
        )

        data = []
        for segment in segments:
            data.append(
                {
                    "start_time": segment.start,
                    "end_time": segment.end,
                    "text": segment.text,
                }
            )
        df = pd.DataFrame(data)

        subtitle_path = SUBTITLES_DIR / f"{stem}-Subtitles.csv"
        df.to_csv(subtitle_path, encoding="utf-8")

    print("Done with subtitles!")
