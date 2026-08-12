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

## Testcase generation
Make sure to include `GEMINI_API_KEY` in `.env`, change the seeds in `utils/config.py` if new tests are needed.
```py
python -m utils.gen_testcase_kis
python -m utils.gen_testcase_vqa
python -m utils.gen_testcase_trake
```

## Webapp - GUI for KIS, VQA, TRAKE tasks and answer export
```sh
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