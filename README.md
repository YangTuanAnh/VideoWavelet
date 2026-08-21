# VideoWavelet V1

## Installation
```sh
python -m venv .venv
.venv/Scripts/activate # Windows
source .venv/bin/activate # Linux/MacOS
pip install uv
uv pip install scenedetect faster-whisper open_clip_torch faiss-cpu transformers pandas google "fastapi[standard]"
uv pip install -r requirements.txt # or use the file
```

## Preprocessing

```py
python -m utils.scenedetect
python -m utils.whisper
python -m utils.siglip2
python -m utils.faiss
```

Or you can use Kaggle's free GPU resources for preprocessing, reference `utils/videowaveletv1.ipynb` for sample code, just configure the dataset path at `VIDEO_FOLDER_ID` and `VIDEO_DIR`

The extected folder structure after preprocessing:
```sh
data
|   faiss.index
|   index.csv
|
└───embeddings
|   |   L21_V001.npy
|   |   L21_V002.npy
|   |   ...
|   
└───frames
|   └───L21_V001
|   |   |   Scene-001-950.jpg
|   |   |   Scene-002-2025.jpg
|   |   |   ...
|   |   
|   └───L21_V002
|   |   |   Scene-001-462.jpg
|   |   |   Scene-002-1150.jpg
|   |   |   ...
|
└───scenes
|   |   L21_V001-Scenes.csv
|   |   L21_V002-Scenes.csv
|   |   ...
|   |   
|
└───subtitles
    |   L21_V001-Subtitles.csv
    |   L21_V002-Subtitles.csv
    |   ...
```
## Testcase generation
Make sure to include `GEMINI_API_KEY` in `.env`, change the seeds in `utils/config.py` if new tests are needed.
```py
python -m utils.gen_testcase_kis
python -m utils.gen_testcase_vqa
python -m utils.gen_testcase_trake
```

## Webapp - GUI for KIS, VQA, TRAKE tasks and answer export
```sh
cd webapp
pnpm dev
```

## Backend server - Runs queries and fetches assets
```sh
fastapi dev utils/server.py
```

## Checklist

- [x] KIS (Text search, image search, subtitle filtering, range view, top reorder, delete)
- [x] VQA (VLM inference, answer propagation)
- [x] TRAKE (sequence matching, temporal penalty, sequence reorder, delete)
- [x] Testcase scripts