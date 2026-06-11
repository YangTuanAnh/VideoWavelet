import faiss             
import os
import numpy as np
from tqdm import tqdm
from .config import FRAMES_DIR, EMB_DIR, DIM_SIZE

if __name__ == "__main__":
    index = faiss.IndexFlatL2(DIM_SIZE)
    embeddings = []
    for vid in os.listdir(FRAMES_DIR):
        vid_path = FRAMES_DIR / vid
        emb_path = EMB_DIR / f"{vid}.npy"

        image_files = sorted(os.listdir(vid_path))
        embs = np.load(emb_path)
        embeddings.append(embs)
        print(embs.shape)

    embeddings = np.concat(embeddings)
    index.add(embeddings)
    faiss.write_index(index, "data/faiss.index")
    print("Done with indexing!")