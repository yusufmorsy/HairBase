from fastapi import FastAPI, HTTPException
import httpx
import os
import base64
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

# TO USE:
# Make sure API key is stored as environment variable
# Run fastapi server locally (uvicorn app:app --reload)
# Send POST request to IP/groq-api-call with JSON body: {"image_path": (whatever the path is)}
# Result will hopefully be returned in JSON format

# Function to encode image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Allows for image path to be specified on api call
class ImageRequest(BaseModel):
   image_path: str 

# Define the Groq API endpoint and the API key (can be stored as an environment variable)
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY is None:
    raise ValueError("Api key not set")

client = Groq(api_key=GROQ_API_KEY)

#prompt
@app.post("/groq-api-call")
async def groq_api_call(request: ImageRequest):
    try:
        # Encode image
        base64_image = encode_image(request.image_path)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": """ What is the brand name, product name, and product type (shampoo, conditioner)? Give me your response in JSON, without any additional formatting. For example, {"brand_name": "Dove", "product_name": "Lavender Plus", "product_type": "shampoo"}. Please respond in this exact format, but using the given image. """},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="llama-3.2-11b-vision-preview",
        )

        #recieve output
        result = chat_completion.choices[0].message.content

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Groq request: {str(e)}")