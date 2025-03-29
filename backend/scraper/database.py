import psycopg
from urllib.parse import urlparse
connStr = "postgres://user:blasterhacks2025@5.161.102.59:5433/postgres"
p = urlparse(connStr)

pg_connection_dict = {
    'dbname': p.path[1:],
    'user': p.username,
    'password': p.password,
    'port': p.port,
    'host': p.hostname
}


with psycopg.connect(**pg_connection_dict) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM types")
        print(cur.fetchone())

        conn.commit()
