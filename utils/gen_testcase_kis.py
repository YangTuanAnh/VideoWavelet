from google import genai
import os
from dotenv import load_dotenv
import pandas as pd
from .config import DATA_DIR, KIS_SEED, VQA_TESTGEN_MODEL_NAME
from PIL import Image
from tqdm import tqdm
import json
import re

load_dotenv()


df = pd.read_csv(DATA_DIR / "index.csv")

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

if __name__ == "__main__":
    rows = df.sample(n=10, random_state=KIS_SEED)

    pbar = tqdm(rows.iterrows(), total=len(rows))
    for idx, row in pbar:
        image_path = row["image_path"]

        image = Image.open(image_path).convert("RGB")

        response = client.models.generate_content(
            model=VQA_TESTGEN_MODEL_NAME,
            contents=[
                """
                Describe this image for image retrieval, ignore the fact they come from a news segment.

                Return ONLY valid JSON:

                {"query": "<description>"}
                """,
                image,
            ],
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

    rows.to_csv(DATA_DIR / "testcase_kis.csv")
    print("Done generating testcases")
