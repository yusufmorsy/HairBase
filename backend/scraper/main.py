import dotenv
import os
dotenv.load_dotenv()
import database
import scraper
import psycopg


if __name__ == "__main__":

    db_key = os.getenv("PSQL_DB")
    print(db_key)

    conn = database.connect_to_db(db_key)


    cat = "cat130038"
    page_cnt = scraper.getPageCount(cat)

    for i in range (1, page_cnt):
        prods = scraper.getPagefromCat(i, cat)

        for i in range (0, 1):
            (prods[i].sku) 
            if prods[i].textures == None:
                continue
            try:
                database.insert_product(prods[i], conn)
            except psycopg.errors.UniqueViolation: # if product is already in product database, skip over
                print("product in db already!")
                continue

            database.insert_texture_pivot(prods[i].sku, prods[i].textures, conn)
            database.insert_type_pivot(prods[i].sku, prods[i].types, conn)
            database.insert_ingredients(prods[i].sku, prods[i].ingredients, conn)
            database.insert_concerns(prods[i].sku, prods[i].concerns, conn)

    
    conn.close()
    
