from fastapi import FastAPI, HTTPException
import os
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv
import json

app = FastAPI()
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if GROQ_API_KEY is None:
    raise ValueError("Api key not set")


# Allows for image path to be specified on api call
class ImageRequest(BaseModel):
   image: str # base64 encoded


client = Groq(api_key=GROQ_API_KEY)


#prompt
@app.post("/groq-ocr")
async def groq_api_call(request: ImageRequest):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": """ What is the brand name, product name, and product type (shampoo, conditioner)? Give me your response in JSON, without any additional formatting. For example, {"brand_name": "Dove", "product_name": "Lavender Plus", "product_type": "shampoo"}. Please respond in this exact format, but using the given image. """},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{request.image}",
                            },
                        },
                    ],
                }
            ],
            model="llama-3.2-11b-vision-preview",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Groq request: {str(e)}")

    result = chat_completion.choices[0].message.content
    return json.loads(result)
