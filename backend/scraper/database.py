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
    # print(product.__dict__.values())
    with conn.cursor() as cur:
        cur.execute("INSERT INTO products (product_id, product_sku, product_name, brand_name, image_url, rating_cnt, avg_rating) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (product.sku, product.sku, product.name, product.brand, str(product.img), product.rating_cnt, str(product.avg_rating)))
        conn.commit()


#ex: for inserting into the pivot tables
def insert_list_to_table(sku:str, attr_list:List[str], table: str, conn: Connection[TupleRow]):

    for item in attr_list:
        
    pass


def insert_one(item: str, table: str, conn: Connection[TupleRow]):
    pass
    
def check_if_exists(item: str, table: str, conn: Connection[TupleRow]):
    pass







