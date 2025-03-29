import dotenv
import os
dotenv.load_dotenv()
import database

if __name__ == "__main__":

    db_key = os.getenv("PSQL_DB")
    print(db_key)

    conn = database.connect_to_db(db_key)

    

    conn.close()
    
