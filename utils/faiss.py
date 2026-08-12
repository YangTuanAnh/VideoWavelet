import faiss
import os
import numpy as np
import pandas as pd
from .config import DATA_DIR, FRAMES_DIR, EMB_DIR, DIM_SIZE, SCENES_DIR, SUBTITLES_DIR
from tqdm import tqdm

if __name__ == "__main__":
    index = faiss.IndexFlatL2(DIM_SIZE)
    embeddings = []
    metadata = []
    for vid in tqdm(os.listdir(FRAMES_DIR)):
        vid_path = FRAMES_DIR / vid
        emb_path = EMB_DIR / f"{vid}.npy"
        scene_path = SCENES_DIR / f"{vid}-Scenes.csv"
        subtitles_path = SUBTITLES_DIR / f"{vid}-Subtitles.csv"

        scene_df = pd.read_csv(scene_path, header=1)
        subtitles_df = pd.read_csv(subtitles_path)

        subtitles_scene = []

        for _, row in scene_df.iterrows():
            start_time = row["Start Time (seconds)"]
            end_time = row["End Time (seconds)"]

            mask = (
                (subtitles_df["start_time"] <= start_time)
                & (subtitles_df["end_time"] >= start_time)
            ) | (
                (subtitles_df["start_time"] <= end_time)
                & (subtitles_df["end_time"] >= end_time)
            )

            subtitles = subtitles_df.loc[mask, "text"].tolist()
            subtitles_scene.append("\n".join(subtitles))

        image_files = sorted(os.listdir(vid_path))
        embs = np.load(emb_path)

        embeddings.append(embs)

        metadata_vid = []

        for img in image_files:
            scene_id = int(img.split("-")[1])
            frame_id = img.split("-")[2].split(".")[0]

            metadata_vid.append(
                {
                    "video": vid,
                    "scene": scene_id,
                    "frame": frame_id,
                    "subtitles": subtitles_scene[scene_id-1] if scene_id-1 < len(subtitles_scene) else "",
                    "image_path": str(vid_path / img),
                }
            )

        metadata.extend(metadata_vid)

    embeddings = np.concat(embeddings)
    index.add(embeddings)
    faiss.write_index(index, str(DATA_DIR / "faiss.index"))
    df = pd.DataFrame(metadata)
    df.to_csv(DATA_DIR / "index.csv")
    print("Done with indexing!")
