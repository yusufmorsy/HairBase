from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, Response
import os
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv
import json
import psycopg
from psycopg.rows import dict_row
import time
import base64

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

        best_len = 999999
        best_q = []

        # create list of items to be included in the queue based off of the binary repesentation
        bnrStr = bin(i)[2:].zfill(qLen)
        for idx in range (0, qLen):
            if bnrStr[idx] == '1':
                curr_query_list.append(query_list[idx])

        if len(curr_query_list) == 1:
            continue

        r = search_db(" ".join(curr_query_list))
        if r == None:
            continue

        if len(r) < best_len:
            best_len = len(r)
            best_q = r
        

        return best_q

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
                        {"type": "text", "text": """
                        This is a picture of a hair product. Your job is to analyze the picture and generate
                         a search query in the form [Company name] [Product Name]. You should expect that these
                         are well-known companies, so you should use your prior knowledge to infer their names,
                         in cases where they are not clear. If you are ever unsure, leave out information
                         that you are not confident in. It is always better to have less terms in the search.
                         Give the example as a plain string, with no additional formatting. For instance, if you
                         saw a picture of a Dove Lavender shampoo, you should simply say "Dove Lavender", without
                         the quotes.
                        """},

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
                        # {"type": "text", "text": """
                        # This is a picture of a hair product, like shampoo or conditioner. Using this image,
                        # decypher the text you see on the product label, and format it in a way that would
                        # create a search query for a POSTGRESQL Database. Format your response as, as well
                        #  as how confident you are in your response in a JSON object. Use the example below:

                        #  {
                        #     "found_text": "Aveda Shampure",
                        #     "confidence": 0.70274
                        #  }
                         
                        # For Example, if you saw an image of a shampoo bottle with the text 'Aveda' and 'Shampure'.
                        # You would respond with, "Aveda Shampure". Only respond with next that you are confident about.
                        # DO NOT SEND ANY ADDITIONAL TEXT. DO NOT SEND ANY ADDITIONAL TEXT. WE ONLY NEED THE STRINGS OF TEXT
                        # THAT YOU ARE CONFIDENT ABOUT.
                        # """},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{request.image}",
                            },
                        },
                    ],
                }
            ],
            # response_format={"type": "json_object"},
            model="llama-3.2-11b-vision-preview",
            stream=False
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Groq request: {str(e)}")

    generated_search_query = chat_completion.choices[0].message.content
    query_list = generated_search_query.split(" ")

    for i in range(0, len(query_list)):
        q = search_db(" ".join(query_list))
        if q == None:
            query_list = query_list[:-1]
        else:
            return q

    return search_db(generated_search_query)

    res = json.loads(generated_search_query)
    # if type(q) == ''
    q = res["found_text"]
    if type(q) == "list":
        q = " ".join(q)
    print("generated response from grok: ", generated_search_query)
    query_list = q.split(" ")
    return best_search_query(query_list, len(query_list))
        


    # return search_db(q["found_text"])

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

class ProductRequest(BaseModel):
    product_name: str
    brand_name: str
    textures: list[str]
    types: list[str]
    ingredients: list[str]
    concerns: list[str]
    image: str


@app.post("/add_product")
def add_product(request: ProductRequest):
    image_url = f"https://blasterhacks.lenixsavesthe.world/img?id={add_img(request.image)}"

    with conn.cursor() as cur:
        pk = int(time.time())
        cur.execute("""INSERT INTO products (product_id, product_name, product_sku, brand_name, image_url) VALUES (%s, %s, %s, %s, %s)""", (pk, request.product_name, str(pk), request.brand_name, image_url))
        
        for texture in request.textures:
            cur.execute("""SELECT id FROM textures WHERE lower(name) = lower(%s)""", (texture,))
            cur.execute("""INSERT INTO textures_to_products (texture_id, product_id) VALUES (%s, %s)""", (cur.fetchone()[0], pk))


        for type in request.types:
            cur.execute("""SELECT id FROM types WHERE lower(name) = lower(%s)""", (type,))
            cur.execute("""INSERT INTO types_to_products (type_id, product_id) VALUES (%s, %s)""", (cur.fetchone()[0], pk))

        for concern in request.concerns:
            cur.execute("""SELECT id FROM concerns WHERE lower(name) = lower(%s)""", (concern,))
            cur.execute("""INSERT INTO concerns_to_products (concern_id, product_id) VALUES (%s, %s)""", (cur.fetchone()[0], pk))

        for ingredient in request.ingredients:
            cur.execute("""SELECT id FROM ingredients WHERE lower(name) = lower(%s)""", (ingredient,))
            cur.execute("""INSERT INTO ingredient_to_products (ingredient_id, product_id) VALUES (%s, %s)""", (cur.fetchone()[0], pk))

    conn.commit()
    return {"productId": pk}


def add_img(img: str):
    with conn.cursor() as cur:
        cur.execute("""INSERT INTO images (encoded_img) values (%s) RETURNING id""", (img,))
        pk = cur.fetchone()[0]
    
    conn.commit()
    return pk


@app.get("/img")
def img(id: int):
    with conn.cursor() as cur:
        cur.execute("""SELECT encoded_img FROM images WHERE id = %s""", (id,))
        encoded_value = cur.fetchone()[0]
        img_data = base64.b64decode(encoded_value)
        return Response(content=img_data, media_type="image/png")


@app.get("/get_recommendations")
def get_recommendations(texture:str,type:str, concerns:list[str] = None, ingredients:list[str] = None):

    # skip doing a join
    # Textures
    # 1 - Straight
    # 2 - Wavy
    # 3 - Curly
    # 4 - Coily

    # Types
    # 2 - Fine
    # 3 - Medium
    # 4 - Thick
    with conn.cursor(row_factory=dict_row) as cur:
        # Build the query dynamically
        query = """
            SELECT 
                json_build_object(
                    'product_id', products.product_id,
                    'product_name', products.product_name,
                    'brand_name', products.brand_name,
                    'image_url', products.image_url,
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
                    ),
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
                    )
                ) AS product
            FROM products
            WHERE 1=1
        """

        # Add filters dynamically
        params = []
        if texture:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM textures_to_products
                    JOIN textures ON textures.id = textures_to_products.texture_id
                    WHERE textures_to_products.product_id = products.product_id
                    AND textures.name = %s
                )
            """
            params.append(texture)

        if type:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM types_to_products
                    JOIN types ON types.id = types_to_products.type_id
                    WHERE types_to_products.product_id = products.product_id
                    AND types.name = %s
                )
            """
            params.append(type)

        if concerns:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM concerns_to_products
                    JOIN concerns ON concerns.id = concerns_to_products.concern_id
                    WHERE concerns_to_products.product_id = products.product_id
                    AND concerns.name = ANY(%s)
                )
            """
            params.append(concerns)

        if ingredients:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM ingredient_to_products
                    JOIN ingredients ON ingredients.id = ingredient_to_products.ingredient_id
                    WHERE ingredient_to_products.product_id = products.product_id
                    AND ingredients.name = ANY(%s)
                )
            """
            params.append(ingredients)

        # Execute the query
        cur.execute(query, params)
        recommendations = cur.fetchall()

    # Extract the JSON objects from the query result
    return {"recommendations": [row["product"] for row in recommendations]}
