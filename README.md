# Working documentation (by hand ofc, how else would you code ahahahahahahahaha)

## Installation
```sh
python -m venv .venv
.venv/Scripts/Activate.ps1 # fuck powershell
pip install uv
uv pip install scenedetect moonshine-voice open_clip_torch transformers faiss-cpu
```

## Preprocessing
```py
python -m utils.keyframes
python -m utils.subtitles
python -m utils.clip
python -m utils.faiss
```

## Indexing
When querying a frame, an embedding should include: frame index, video id, scene number, file path