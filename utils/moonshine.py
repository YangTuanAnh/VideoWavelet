import os
import glob
import subprocess
from pathlib import Path
from tqdm import tqdm
import pandas as pd

from moonshine_voice import (
    Transcriber,
    load_wav_file,
    get_model_for_language,
)

from .config import VIDEO_DIR, DATA_DIR, SUBTITLES_DIR, video_ext

if __name__ == "__main__":
    files = []
    for ext in video_ext:
        files.extend(glob.glob(os.path.join(VIDEO_DIR, "**" , ext), recursive=True))

    model_path, model_arch = get_model_for_language("vi")
    transcriber = Transcriber(model_path=model_path, model_arch=model_arch)

    os.makedirs(SUBTITLES_DIR, exist_ok=True)

    for video_path in tqdm(files):
        stem = Path(video_path).stem
        audio_path = DATA_DIR / "tmp.wav"

        subprocess.run([
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-hide_banner", "-loglevel", "error",
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            "-acodec", "pcm_s16le",
            audio_path
        ], check=True)

        print("Transcribing:", video_path)
        audio_data, sample_rate = load_wav_file(audio_path)
        transcript = transcriber.transcribe_without_streaming(
            audio_data, sample_rate=sample_rate, flags=0
        )
        data = []
        for line in transcript.lines:
            data.append({
                "start_time": line.start_time,
                "end_time": line.start_time + line.duration,
                "text": line.text
            })
        df = pd.DataFrame(data)

        subtitle_path = SUBTITLES_DIR / f"{stem}-Subtitles.csv"
        df.to_csv(subtitle_path, encoding="utf-8")

    print("Done with subtitles!")