import os
from dotenv import load_dotenv
load_dotenv()

from google import genai

API_KEY = os.getenv("GEMINI_API_KEY")
try:
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model='models/gemini-2.5-flash',
        contents='Say hello in one sentence.'
    )
    print(f"SUCCESS! Response: {response.text}")
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    traceback.print_exc()
