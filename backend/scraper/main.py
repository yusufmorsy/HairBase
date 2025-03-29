import dotenv
import os
dotenv.load_dotenv()
import database
import scraper


if __name__ == "__main__":

    db_key = os.getenv("PSQL_DB")
    print(db_key)

    conn = database.connect_to_db(db_key)


    page_cnt = scraper.getPageCount("cat130038")

    

    conn.close()
    
