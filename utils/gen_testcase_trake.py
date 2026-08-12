from google import genai
import os
from dotenv import load_dotenv
import pandas as pd
from .config import DATA_DIR, TRAKE_SEED, VQA_TESTGEN_MODEL_NAME
from PIL import Image
from tqdm import tqdm
import json
import re

load_dotenv()

df = pd.read_csv(DATA_DIR / "index.csv")

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

if __name__ == "__main__":
    RANGE = 2

    rows = df.sample(n=10, random_state=TRAKE_SEED)

    pbar = tqdm(rows.iterrows(), total=len(rows))
    for idx, row in pbar:
        video = row["video"]
        scene = row["scene"]

        scene_rows = df[
            (df["video"] == video)
            & (df["scene"] >= scene - RANGE)
            & (df["scene"] <= scene + RANGE)
        ].sort_values("scene")

        images = []

        for _, scene_row in scene_rows.iterrows():
            images.append(Image.open(scene_row["image_path"]).convert("RGB"))

        if len(images) == 0:
            continue

        response = client.models.generate_content(
            model=VQA_TESTGEN_MODEL_NAME,
            contents=[
                f"""
                These {len(images)} images are consecutive scenes from a video.

                Describe the event step-by-step as a temporal retrieval query.

                Focus on:
                - who or what is present
                - what actions occur
                - how the actions progress over time

                The query should describe the full sequence rather than
                individual frames, ignore the fact they come from a news segment.

                Example:
                "a woman walks into a room, picks up a book,
                sits on a couch, and starts reading"

                Return ONLY valid JSON:

                {{
                    "query": "<temporal description>"
                }}
                """
            ]
            + images,
        )

        match = re.search(
            r"```(?:json)?\s*(\{.*?\})\s*```|(\{.*\})",
            response.text,
            re.DOTALL,
        )

        if not match:
            raise ValueError("No JSON found")

        json_str = match.group(1) or match.group(2)
        query = json.loads(json_str)["query"]

        rows.loc[idx, "query"] = query

        pbar.set_postfix({"response": query[:100]})

    rows.to_csv(DATA_DIR / "testcase_trake.csv", index=False)
