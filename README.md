# Working documentation (by hand ofc, how else would you code ahahahahahahahaha)

## Installation
```sh
python -m venv .venv
.venv/Scripts/Activate.ps1 # fuck powershell
pip install uv
uv pip install scenedetect moonshine-voice open_clip_torch faiss-cpu pandas "fastapi[standard]" num2words accelerate bitsandbytes>=0.46.1
```

## Preprocessing
```py
python -m utils.scenedetect
python -m utils.moonshine
python -m utils.siglip2
python -m utils.faiss
```

## Init component code
NextJS and Shadcn is used for rendering, might use FastAPI for retrieval and data fetching
```sh
pnpm dlx shadcn@latest add sidebar input-group table badge spinner item popover radio-group label context-menu hover-card
```
## Backend server
Runs queries and fetches assets
```sh
fastapi dev utils/server.py
```

## Checklist

- [x] KIS (Text search, image search, subtitle filtering, range view, top reorder, delete)
- [x] VQA (VLM inference, answer propagation)
- [x] TRAKE (sequence matching, temporal penalty, sequence reorder, delete)