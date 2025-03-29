import psycopg
from urllib.parse import urlparse
from scraper import Product
from psycopg.connection import Connection
from psycopg.rows import TupleRow
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
        cur.execute("INSERT INTO ")
    







