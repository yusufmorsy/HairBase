import psycopg
from urllib.parse import urlparse
from scraper import Product
from psycopg.connection import Connection
from psycopg.rows import TupleRow
from typing import List
def connect_to_db(key: str) -> Connection[TupleRow]:
    p = urlparse(key)
    pg_connection_dict = {
        'dbname': p.path[1:],
        'user': p.username,
        'password': p.password,
        'port': p.port,
        'host': p.hostname
    }

    conn = psycopg.connect(**pg_connection_dict)

    return conn

def insert_product(product: Product, conn: Connection[TupleRow]):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO products (product_id, product_sku, product_name, brand_name, image_url, rating_cnt, avg_rating) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (product.sku, product.sku, product.name, product.brand, str(product.img), product.rating_cnt, str(product.avg_rating)))
        conn.commit()


#ex: for inserting into the pivot tables
def insert_texture_pivot(sku: str, attrs: List[str], conn: Connection[TupleRow]):
    with conn.cursor() as cur:

        for i in attrs:
            cur.execute("""
                SELECT id
                FROM textures
                WHERE name = %s
            """, (i,))

            texture_id = cur.fetchone()
            if texture_id:
                texture_id = texture_id[0]

            cur.execute("""
                    INSERT INTO textures_to_products (product_id, texture_id)
                    VALUES (%s, %s)
                """, (sku, texture_id))
            
        conn.commit()
        print("inserted texture pivots for sku:", sku)

def insert_type_pivot(sku: str, attrs: List[str], conn: Connection[TupleRow]):

    with conn.cursor() as cur:
        for i in attrs:
            cur.execute("""
                SELECT id 
                FROM types
                WHERE name = %s
            """, (i,))
            type_id = cur.fetchone()
            if type_id:
                type_id = type_id[0]

            cur.execute("""
                INSERT INTO types_to_products (product_id, type_id)
                VALUES (%s, %s)
            """, (sku, type_id))
    conn.commit()
    print("inserted type pivots for sku:", sku)

def insert_ingredients(sku: str, attrs: List[str], conn: Connection[TupleRow]):
    # check to see if ingredient is already in DB
    with conn.cursor() as cur:
        for i in attrs:
            cur.execute("""
                SELECT * 
                FROM ingredients
                WHERE name = %s
            """, (i,))

            v = cur.fetchone()
            if not v:
                #if value is not in the table, insert it
                print("value not found, inserting...")
                cur.execute("""
                    INSERT INTO ingredients (name) VALUES (%s)
                """, (i,))

            # query again no matter what to get the ID
            cur.execute("""
                SELECT * 
                FROM ingredients
                WHERE name = %s
            """, (i,))

            # we already know the id has to exist
            ingredient_id = cur.fetchone()
            ingredient_id = ingredient_id[0]

            cur.execute("""
                INSERT INTO ingredient_to_products (product_id, ingredient_id)
                VALUES (%s, %s)
            """, (sku, ingredient_id))

        conn.commit()
        print("inserted type pivots for sku:", sku)

def insert_concerns(sku: str, attrs: List[str], conn: Connection[TupleRow]):
    # check to see if ingredient is already in DB
    with conn.cursor() as cur:
        for i in attrs:
            cur.execute("""
                SELECT * 
                FROM concerns
                WHERE name = %s
            """, (i,))

            v = cur.fetchone()
            if not v:
                #if value is not in the table, insert it
                print("value not found, inserting...")
                cur.execute("""
                    INSERT INTO concerns (name) VALUES (%s)
                """, (i,))

            # query again no matter what to get the ID
            cur.execute("""
                SELECT * 
                FROM concerns
                WHERE name = %s
            """, (i,))

            # we already know the id has to exist
            concern_id = cur.fetchone()
            concern_id = concern_id[0]

            cur.execute("""
                INSERT INTO concerns_to_products (product_id, concern_id)
                VALUES (%s, %s)
            """, (sku, concern_id))

        conn.commit()
        print("inserted type pivots for sku:", sku)



def insert_one(item: str, table: str, conn: Connection[TupleRow]):
    pass
    
def check_if_exists(item: str, table: str, conn: Connection[TupleRow]):
    pass







