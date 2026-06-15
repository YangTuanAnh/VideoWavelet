from google import genai
import os
from dotenv import load_dotenv
import pandas as pd
from .config import DATA_DIR, VQA_SEED, VQA_TESTGEN_MODEL_NAME
from PIL import Image
from tqdm import tqdm
import json
import re

load_dotenv()


df = pd.read_csv(DATA_DIR / "index.csv")

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

if __name__ == "__main__":
    rows = df.sample(n=10, random_state=VQA_SEED)

    pbar = tqdm(rows.iterrows(), total=len(rows))
    for idx, row in pbar:
        image_path = row["image_path"]

        image = Image.open(image_path).convert("RGB")

        response = client.models.generate_content(
            model=VQA_TESTGEN_MODEL_NAME,
            contents=[
                """
                Provide a question and answer for visual question answering, the question should also include some description for image retrieval, ignore the fact they come from a news segment.

                Return ONLY valid JSON:

                {
                    "question": "<description>",
                    "answer": "<answer>"
                }
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
        question = json.loads(json_str)["question"]
        answer = json.loads(json_str)["answer"]
        rows.loc[idx, "question"] = question
        rows.loc[idx, "answer"] = answer

        pbar.set_postfix({"response": question[:100]})

    rows.to_csv(DATA_DIR / "testcase_vqa.csv")
    print("Done generating testcases")
