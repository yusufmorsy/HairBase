from fastapi import FastAPI
import os
import psycopg2

app = FastAPI()

# In a real application, consider an async driver or ORM 
# (e.g., asyncpg or SQLAlchemy) for better performance.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/app_db")

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.get("/db-test")
def test_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        record = cur.fetchone()
        return {"postgres_version": record}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()