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
    # return {
    #     "product_name": "Lavender Shampoo",
    #     "brand_name": "Dove",
    #     "product_type": "shampoo"
    # }
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

    return search_db(generated_search_query)

def search_db(query: str):
    with conn.cursor() as cur:
        cur.execute("""
                SELECT 
                    json_agg(
                        json_build_object(
                            'product_id', products.product_id,
                            'product_name', product_name,
                            'brand_name', brand_name,
                            'rank', ts_rank(to_tsvector(product_name || ' ' || brand_name), websearch_to_tsquery('english', %s)),
                            'concerns', (
                                SELECT json_agg(concerns.name) 
                                FROM concerns_to_products 
                                JOIN concerns ON concerns.id = concerns_to_products.concern_id
                                WHERE concerns_to_products.product_id = products.product_id
                            ),
                            'ingredients', (
                                SELECT json_agg(ingredients.name)
                                FROM ingredient_to_products
                                JOIN ingredients ON ingredients.id = ingredient_to_products.ingredient_id
                                WHERE ingredient_to_products.product_id = products.product_id
                            ),
                            'textures', (
                                SELECT json_agg(textures.name)
                                FROM textures_to_products
                                JOIN textures ON textures.id = textures_to_products.texture_id
                                WHERE textures_to_products.product_id = products.product_id
                            ),
                            'types', (
                                SELECT json_agg(types.name)
                                FROM types_to_products
                                JOIN types ON types.id = types_to_products.type_id
                                WHERE types_to_products.product_id = products.product_id
                            )
                        )
                    ) as json_result
                FROM products
                WHERE to_tsvector(product_name || ' ' || brand_name) @@ websearch_to_tsquery('english', %s)
                LIMIT 20;
                """, (query, query))
        return cur.fetchone()[0]  # Get the JSON array result
        
@app.get("/search")
def product_search(query: str):
    return search_db(query)
