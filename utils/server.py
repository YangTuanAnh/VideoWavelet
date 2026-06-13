from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import faiss             
from .config import DATA_DIR, CLIP_MODEL_NAME
import torch
import open_clip
import pandas as pd
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

index = faiss.read_index(str(DATA_DIR / "faiss.index"))
df = pd.read_csv(DATA_DIR / "index.csv")

model, _ = open_clip.create_model_from_pretrained(CLIP_MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.eval().to(device)
tokenizer = open_clip.get_tokenizer(CLIP_MODEL_NAME)

class Result(BaseModel):
    score: float
    index: int
    video: str
    scene: int
    frame: int

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/search")
async def search(query: str, k: int = 10) -> List[Result]:
    text = tokenizer([query])

    with torch.no_grad(), torch.autocast(device):
        text_features = model.encode_text(text)
        text_features /= text_features.norm(dim=-1, keepdim=True)

    text_features = text_features.cpu().float().numpy()
    D, I = index.search(text_features, k)

    return [
        Result(
            score=score,
            index=idx,
            video=row['video'],
            scene=row['scene'],
            frame=row['frame'],
        ) for score, (idx, row) in zip(D[0], df.loc[I[0]].iterrows())
    ]

@app.get("/frame")
async def get_frame(video: str, scene: int):
    rows = df.loc[(df["video"] == video) & (df["scene"] == scene), "image_path"]

    if rows.empty:
        raise HTTPException(status_code=404, detail="Frame not found in database")

    image_path = rows.iloc[0]

    if not image_path:
        raise HTTPException(status_code=404, detail="Image path is empty")

    return FileResponse(image_path, media_type="image/jpeg")