import faiss             
import os
import numpy as np
import pandas as pd
from .config import DATA_DIR, FRAMES_DIR, EMB_DIR, DIM_SIZE

if __name__ == "__main__":
    index = faiss.IndexFlatL2(DIM_SIZE)
    embeddings = []
    metadata = []
    for vid in os.listdir(FRAMES_DIR):
        vid_path = FRAMES_DIR / vid
        emb_path = EMB_DIR / f"{vid}.npy"

        image_files = sorted(os.listdir(vid_path))
        embs = np.load(emb_path)
        embeddings.append(embs)
        
        metadata_vid = [{
            'video': vid,
            'scene': img.split('-')[1],
            'frame': img.split('-')[2].split('.')[0],
            'image_path': vid_path / img
        } for img in image_files]
        metadata.extend(metadata_vid)

    embeddings = np.concat(embeddings)
    index.add(embeddings)
    faiss.write_index(index, str(DATA_DIR / "faiss.index"))
    df = pd.DataFrame(metadata)
    df.to_csv(DATA_DIR / "index.csv")
    print("Done with indexing!")