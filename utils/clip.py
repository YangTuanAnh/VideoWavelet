import os
import torch
from PIL import Image
import open_clip
import numpy as np
from tqdm import tqdm

from .config import FRAMES_DIR, EMB_DIR, BATCH_SIZE, CLIP_MODEL_NAME

if __name__ == "__main__":
    os.makedirs(EMB_DIR, exist_ok=True)

    model, preprocess = open_clip.create_model_from_pretrained(CLIP_MODEL_NAME)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.eval().to(device)
    tokenizer = open_clip.get_tokenizer(CLIP_MODEL_NAME)

    with torch.no_grad(), torch.autocast(device):
        for vid in os.listdir(FRAMES_DIR):
            vid_path = FRAMES_DIR / vid
            emb_path = EMB_DIR / f"{vid}.npy"

            image_files = sorted(os.listdir(vid_path))
            embeddings = []
            
            for i in tqdm(range(0, len(image_files), BATCH_SIZE), desc=f"Embedding: {vid_path}"):
                batch_imgs = []
            
                for img_name in image_files[i:i+BATCH_SIZE]:
                    img = Image.open(os.path.join(vid_path, img_name)).convert("RGB")
                    batch_imgs.append(preprocess(img))
            
                batch = torch.stack(batch_imgs).to(device)
                image_features = model.encode_image(batch)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
                embeddings.append(image_features.cpu().float().numpy())
            
            embeddings = np.concatenate(embeddings, axis=0)
            np.save(emb_path, embeddings)

    print("Done with embeddings!")