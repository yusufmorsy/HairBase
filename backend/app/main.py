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
    conn = psycopg.Connection.connect(row_factory=dict_row)
    conn.execute("""
                SELECT
                    products.id,
                    products.name,
                    brands.id,
                    brands.name,
                    to_tsvector(products.title || ' ' || products.name || ' ' || brands.name ) AS vector,
                    plainto_tsquery(?) AS query
                    ts_rank(vector, query) AS rank,
                FROM
                    products INNER JOIN brands 
                        ON products.brand_id = brands.id
                WHERE vector @@ query
            """, query)
    
    return conn.fetchall()
