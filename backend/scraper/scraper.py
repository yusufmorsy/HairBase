import requests
import re


class Product:
    def __init__(self, sku, name: str, brand: str, img: str, rating_cnt: int, avg_rating: int, concerns, textures, types, ingredients) :
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
    print(key_benefit)

    if not any(_ in textures[0] for _ in anyTexture):
        # print("Textures Match!")
        t = textures
        textures = types
        types = t

    # print("Target Textures:", textures[0].split("Hair")[0])
    # print("Target Types:", types[0].split("Hair")[0])
    return textures[0].split("Hair")[0], types[0].split("Hair")[0]

def normalizeText(text: str) -> str:
    t = text.replace(" - ", " -")
    t = text.replace("&nbsp;", " ")
    return t

headers = {
    'Host': 'sephora.cnstrc.com',
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
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

response = requests.get('https://sephora.cnstrc.com/browse/group_id/cat130038', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('https://sephora.cnstrc.com/browse/v1/pods/ymal-test?c=ciojs-client-2.62.2&key=u7PNVQx-prod-en-us&i=bba62100-82f5-4901-bc87-dce7c8eee364&s=2&item_id=P412087&variations_map=%7B%22values%22%3A%7B%22network_status%22%3A%7B%22aggregation%22%3A%22max%22%2C%22field%22%3A%22data.sku_availability.network_SEPHORAUS%22%7D%2C%22store_status%22%3A%7B%22aggregation%22%3A%22max%22%2C%22field%22%3A%22data.sku_availability.store_123%22%7D%2C%22sku_count%22%3A%7B%22aggregation%22%3A%22count%22%7D%2C%22sale_count%22%3A%7B%22aggregation%22%3A%22value_count%22%2C%22field%22%3A%22data.facets.on_sale%22%2C%22value%22%3Atrue%7D%2C%22min_list_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.currentSku.listPriceFloat%22%7D%2C%22max_list_price%22%3A%7B%22aggregation%22%3A%22max%22%2C%22field%22%3A%22data.currentSku.listPriceFloat%22%7D%2C%22min_sale_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.currentSku.salePriceFloat%22%7D%2C%22max_sale_price%22%3A%7B%22aggregation%22%3A%22max%22%2C%22field%22%3A%22data.currentSku.salePriceFloat%22%7D%2C%22min_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.currentSku.finalPriceFloat%22%7D%2C%22max_price%22%3A%7B%22aggregation%22%3A%22max%22%2C%22field%22%3A%22data.facets.finalPriceFloat%22%7D%2C%22moreColors%22%3A%7B%22aggregation%22%3A%22all%22%2C%22field%22%3A%22data.currentSku.colorName%22%7D%7D%2C%22dtype%22%3A%22object%22%7D', headers=headers)

resp = response.json()
results = resp["response"]["results"]

for item in results:
    print(f'Brand Name: {item["data"]["brandName"]}')
    print(f'Prod. Name: {item["value"]}')
    facets = item["data"]["facets"]
    for i in facets:
        match i["name"]:
            case "Concerns":
                print(f'Concerns..: {i["values"]}')
            case "Ingredient Preferences":
                print(f'Ingredient Preferences: {i["values"]}')

    print(f'Image URL: {item["data"]["image_url"].split("?")[0]}')   
    print(f'Avg Rating: {item["data"]["rating"]}')   
    print(f'Total Reviews: {item["data"]["totalReviews"]}')

    extDesc = item["data"]["extended_description"]
    cleanText = normalizeText(extDesc)
    textures, types = parseRegex(cleanText)
    if (textures == ""):
        textures = "N/A"
    
    if (types == ""):
        types = "N/A"
    
    print(f"Target Textures: {textures}")
    print(f"Target Types: {types}")

    print("----")

print(response.url)

