import requests
import re
import math
from typing import List


class Product:
    def __init__(self, sku, name: str, brand: str, img: str, rating_cnt: int, avg_rating: int, concerns, textures, types, ingredients,benefits, price, size) :
        self.sku = sku
        self.name = name
        self.brand = brand
        self.img = img
        self.rating_cnt = rating_cnt
        self.avg_rating = avg_rating
        self.concerns = concerns
        self.textures = textures
        self.types = types
        self.ingredients = ingredients
        self.benefits =  benefits
        self.price
        self.size

# Returns texture, type, benefits
def parseRegex(text: str):

    anyTexture = ["Straight", "Wavy", "Curly", "Coily"]
    anyType = ["Fine", "Medium", "Thick"]

    texture_pattern = r"Hair Texture:\s*([A-Za-z, and]+)"
    type_pattern = r"Hair Type:\s*([A-Za-z, and]+)"
    benefits_pattern = r"Key Benefits: -([^\-]+(?:\- [^\-]+)*)"
    textures = re.findall(texture_pattern, text)
    types = re.findall(type_pattern, text)
    benefits = re.findall(benefits_pattern, text)

    if len(benefits) == 0:
        return "", ""


    if len(textures) == 0:
        return "", ""


    if len(types) == 0:
        return "", ""
    
    benefit_strip = benefits[0].split("Highlighted Ingredients:")[0]
    key_benefit = [benefit.strip() for benefit in benefit_strip.split("-")]
    for i in range(0, len(key_benefit)):
        if "Formulation" in key_benefit[i]:
            key_benefit[i] = key_benefit[i].split("Formulation")[0]
    # print(key_benefit)

    if not any(_ in textures[0] for _ in anyTexture):
        # print("Textures Match!")
        t = textures
        textures = types
        types = t

    texture_list = textures[0].split("Hair")[0].split(" ")
    texture_list = [t.replace(",", "") for t in texture_list]
    try:
        texture_list.remove('and')
    except ValueError:
        pass

    types_list = types[0].split("Hair")[0].split(" ")
    types_list = [t.replace(",", "") for t in types_list]
    try:
        types_list.remove('and')
    except ValueError:
        pass

    return texture_list, types_list

def normalizeText(text: str) -> str:
    t = text.replace(" - ", " -")
    t = text.replace("&nbsp;", " ")
    return t

def getPageCount(category_id: str) -> int:
    headers = {
    'Host': 'sephora.cnstrc.com',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
        }
    
    params = (
    ('c', 'ciojs-client-2.62.2'),
    ('key', 'u7PNVQx-prod-en-us'),
    # ('i', 'bba62100-82f5-4901-bc87-dce7c8eee364'),
    ('s', '2'),
    # ('ids', 'P412087'),
    # ('variations_map', '{"values":{"network_status":{"aggregation":"max","field":"data.sku_availability.network_SEPHORAUS"},"store_status":{"aggregation":"max","field":"data.sku_availability.store_123"},"sku_count":{"aggregation":"count"},"sale_count":{"aggregation":"value_count","field":"data.facets.on_sale","value":true},"min_list_price":{"aggregation":"min","field":"data.currentSku.listPriceFloat"},"max_list_price":{"aggregation":"max","field":"data.currentSku.listPriceFloat"},"min_sale_price":{"aggregation":"min","field":"data.currentSku.salePriceFloat"},"max_sale_price":{"aggregation":"max","field":"data.currentSku.salePriceFloat"},"min_price":{"aggregation":"min","field":"data.currentSku.finalPriceFloat"},"max_price":{"aggregation":"max","field":"data.facets.finalPriceFloat"},"moreColors":{"aggregation":"all","field":"data.currentSku.colorName"}},"dtype":"object"}'),
    )

    response = requests.get('https://sephora.cnstrc.com/browse/group_id/' + category_id, headers=headers, params=params)
    res = (response.json())
    item_count = (res["response"]["total_num_results"])


    return math.ceil(item_count/20)

def getPagefromCat(page:int, category: str) -> List[Product]:
    prodList = []
    concerns = None
    ingredients = None
    headers = {
        'Host': 'sephora.cnstrc.com',
        'Connection': 'keep-alive',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    params = (
        ('c', 'ciojs-client-2.62.2'),
        ('key', 'u7PNVQx-prod-en-us'),
        ('s', '2'),
        ('page', page)
    )

    response = requests.get('https://sephora.cnstrc.com/browse/group_id/' + category, headers=headers, params=params)
    resp = response.json()
    results = resp["response"]["results"]

    for item in results:
        brand = item["data"]["brandName"]
        prod_name = item["value"]
        facets = item["data"]["facets"]
        for i in facets:
            match i["name"]:
                case "Concerns":
                    concerns = i["values"]
                case "Ingredient Preferences":
                    ingredients = i["values"]

        img = {item["data"]["image_url"].split("?")[0]}
        avg_rating = {item["data"]["rating"]}
        rating_cnt = {item["data"]["totalReviews"]}
        sku = item["data"]["currentSku"]["skuId"]
        extDesc = item["data"]["extended_description"]
        cleanText = normalizeText(extDesc)
        textures, types = parseRegex(cleanText)
        if (textures == ""):
            textures = "N/A"
        
        if (types == ""):
            types = "N/A"

        try :
            p = Product(sku, prod_name, brand, img, rating_cnt, avg_rating, concerns, textures, types, ingredients)
            prodList.append(p)
        finally:
            print("error creating product: sku", sku)

    return prodList