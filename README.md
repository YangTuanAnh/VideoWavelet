# Working documentation (by hand ofc, how else would you code ahahahahahahahaha)

## Installation
```sh
python -m venv .venv
.venv/Scripts/Activate.ps1 # fuck powershell
pip install uv
uv pip install scenedetect moonshine-voice open_clip_torch faiss-cpu pandas "fastapi[standard]"
```

## Preprocessing
```py
python -m utils.keyframes
python -m utils.subtitles
python -m utils.clip
python -m utils.faiss
```

## Init component code
NextJS and Shacdn is used for rendering, might use FastAPI for retrieval and data fetching
```sh
pnpm dlx shadcn@latest add card sidebar input-group table
```
## Backend server
Runs queries and fetches assets
```sh
fastapi dev utils/server.py
```

2 main routes: `/search?query=text&k=10` and `/frame?video=L01_V001&scene=1`