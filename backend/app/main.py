from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
import os
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv
import json
import psycopg
from psycopg.rows import dict_row

app = FastAPI()
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
POSTGRES_URL = os.getenv("POSTGRES_URL")

if GROQ_API_KEY is None:
    raise ValueError("Api key not set")


# Allows for image path to be specified on api call
class ImageRequest(BaseModel):
   image: str # base64 encoded


client = Groq(api_key=GROQ_API_KEY)

def connect_to_db():

    p = urlparse(POSTGRES_URL)
    pg_connection_dict = {
        'dbname': p.path[1:],
        'user': p.username,
        'password': p.password,
        'port': p.port,
        'host': p.hostname
    }
    
    return psycopg.connect(**pg_connection_dict)

conn = connect_to_db()

#prompt
@app.post("/groq-ocr")
async def groq_api_call(request: ImageRequest):
    return {
        "product_name": "Lavender Shampoo",
        "brand_name": "Dove",
        "product_type": "shampoo"
    }
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": """This is a picture of a hair product (like shampoo or conditioner). Using only the product and brand name (no extra information), please give me a search query to find this item. For example, for a different product, with the name 'Lavender & Volume', by a company named 'Dove', you would say, "Dove Lavender & Volume". It might not be that simple, though, so do your best. Please do not include any additional formatting or commentary."""},
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

    generated_search_query = chat_completion.choices[0].message.content
    
    # Needs settings here
    

@app.get("/search")
def product_search(query: str):
    conn.execute("""SELECT product_id, product_name, brand_name, ts_rank(to_tsvector(product_name || ' ' || brand_name), websearch_to_tsquery('english', ?)) FROM products WHERE to_tsvector(product_name || ' ' || brand_name) @@ websearch_to_tsquery('english', ?);""", (query, query))
    return conn.fetchall()
