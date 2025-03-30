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

def best_search_query(query_list: list[str], qLen: int):

    bRep = 2**qLen

    for i in range (1, bRep):
        curr_query_list = []

        # create list of items to be included in the queue based off of the binary repesentation
        bnrStr = bin(i)[2:].zfill(qLen)
        for idx in range (0, qLen):
            if bnrStr[idx] == '1':
                curr_query_list.append(query_list[idx])

        r = search_db(" ".join(curr_query_list))
        if r == None:
            continue
        if len(r) < 5:
            for i in r:
                print(i["brand_name"] + " " + i["product_name"])

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
                        # {"type": "text", "text": """
                        #  This is a picture of a hair product (like shampoo or conditioner). Using only
                        #  the product and brand name (no extra information), please give me a search query
                        #  to find this item. For example, for a different product, with the name 'Lavender
                        #  & Volume', by a company named 'Dove', you would say, "Dove Lavender & Volume".
                        #  It might not be that simple, though, so do your best. Your response should be as
                        #  minimal as possible, while still being able to find the find the product. If you
                        #  aren't confident about something, leave it out. If you aren't confident about
                        #  something, but you think it is necessary to find the product, put it last in the
                        #  query. For example, if you saw "Dove", "Lavender", and "Beauty" (and you thought
                        #  beauty was a part of the product's name, but weren't confident about it, possibly
                        #  because it is slightly distorted, or might not be part of the product name) you
                        #  would write "Dove Lavender", or possibly "Dove Lavender Beauty", but definitely
                        #  not "Dove Beauty Lavender". Please do not include any additional formatting or
                        #  commentary."""},
                        {"type": "text", "text": """
                        This is a picture of a hair product, like shampoo or conditioner. Using this image,
                        decypher the text you see on the product label, and format it in a way that would
                        create a search query for a POSTGRESQL Database. Format your response as, as well
                         as how confident you are in your response in a JSON object. Use the example below:

                         {
                            "found_text": "Aveda Shampure",
                            "confidence": 0.70274
                         }
                         
                        For Example, if you saw an image of a shampoo bottle with the text 'Aveda' and 'Shampure'.
                        You would respond with, "Aveda Shampure". Only respond with next that you are confident about.
                        DO NOT SEND ANY ADDITIONAL TEXT. DO NOT SEND ANY ADDITIONAL TEXT. WE ONLY NEED THE STRINGS OF TEXT
                        THAT YOU ARE CONFIDENT ABOUT.
                        """},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{request.image}",
                            },
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
            model="llama-3.2-11b-vision-preview",
            stream=False
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Groq request: {str(e)}")

    generated_search_query = chat_completion.choices[0].message.content

    q = json.loads(generated_search_query)
    best_search_query(query_list, len(query_list))
    query_list = q["found_text"].split(" ")
    for i in range(0, len(query_list)):
        q = search_db(" ".join(query_list))
        print("q:", q)
        if q == None:
            query_list = query_list[:-1]
        else:
            return q
        


    return search_db(q["found_text"])

def search_db(query: str):
    print(f"incoming search query: {query}")
    with conn.cursor() as cur:
        cur.execute("""
                SELECT 
                    json_agg(
                        json_build_object(
                            'product_id', products.product_id,
                            'product_name', product_name,
                            'brand_name', brand_name,
                            'image_url', image_url,
                            'rank', ts_rank(to_tsvector(unaccent(product_name) || ' ' || unaccent(brand_name)), websearch_to_tsquery('english', unaccent(%s))),
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
                WHERE to_tsvector(unaccent(product_name) || ' ' || unaccent(brand_name)) @@ websearch_to_tsquery('english', unaccent(%s))
                LIMIT 20;
                """, (query, query))
        
        return cur.fetchone()[0]  # Get the JSON array result
        
@app.get("/search")
def product_search(query: str):

    return search_db(query)

@app.get("/show_product")
def show_product(product_id: int):      
    with conn.cursor() as cur:
        cur.execute("""
                SELECT 
                    json_agg(
                        json_build_object(
                            'product_id', products.product_id,
                            'product_name', product_name,
                            'brand_name', brand_name,
                            'image_url', image_url,
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
                WHERE product_id = %s;
                """, (product_id,))
        return cur.fetchone()[0][0]  # Get the JSON array result

@app.get("/groq_concerns")
def groq_concerns(query: str):
    
    return {
        "name": "Product name",
        "brand": "Brand name",
        "textures": [
            "straight",
            "wavy",
            "curly",
            "coily"
        ],
        "types": [
            "fine",
            "medium",
            "thick",
        ],
        "concerns": [
            "dryness"
        ],
        "ingredients": [
            "vegan",
        ]
    }
