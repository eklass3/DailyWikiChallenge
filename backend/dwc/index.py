from flask import Flask, request
from g4f.client import Client
from json_repair import repair_json
import json, requests, random, string
import hashlib

app = Flask(__name__)

client = Client()#GPT client

wikiUrl = "https://en.wikipedia.org/w/api.php"#Wikipedia API URL
maxResultSet = 100 #Max number of results from search set.

catFood = ["Fast food", "Flavors of ice cream", "Types of food", "Fictional food and drink", "Staple foods", "Canadian beer brands", "Pizza", "Cakes", "Bagels"]

catCountries =["Countries in Europe", "Countries in North America", "Countries in South America", "Countries in Africa", "Countries in Asia", "Countries in Oceania"]

def hashed(seed):
    return hashlib.sha256(seed.encode()).hexdigest()

def generate_random_string():
    length = random.randint(0, 4)
    letters = string.ascii_letters
    result_str = ''.join(random.choice(letters) for _ in range(length))
    return result_str

#Generate question endpoint.
@app.route('/generate', methods=['GET'])
def generate():
    searchData = getArticlesTEST()#Get articles from Wikipedia, based on a random search
    imgSource = ""
    imgHeight = 0
    imgWidth = 0
  # Keep trying until we get an image
    while True:
        print(searchData)

        pageid = searchData["query"]["categorymembers"][random.randint(0, len(searchData["query"]["categorymembers"])-1)]["pageid"]

        imageData = getImage(pageid)

        # Use dict.get method to avoid KeyError if 'thumbnail' or 'source' is not present
        imgSource = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("source")
        imgHeight = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("height")
        imgWidth = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("width")

        if imgSource is not None:
            break

    articleData = getData(pageid)
    data = articleData["query"]["pages"][str(pageid)]["extract"]
    answer = articleData["query"]["pages"][str(pageid)]["title"]

    example_json = {
        "question": "",
        "category": "",
        "funFact": "",
        "hints": {
            "hint1": "",
            "hint2": "",
            "hint3": "",
        }
    }
    
    while True:#GPT question prompt.
        prompt = "Write a trivia question and three progressively easier hints, where this is the answer " + answer + ". Do not say the answer in the question or hints. Add the trivia category, and a fun fact. If the answer is a type of list include \"(a list)\" in the question. Here is some background info: " + data

        details = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type":"json_object"},
            messages=[
                {"role":"system", "content": "Provide output in valid JSON and in English. The data schema should be like this: " + json.dumps(example_json)},
                {"role": "user", "content": prompt}
            ]
        )

        details = details.choices[0].message.content


        if repair_json(details) != "":
            break

    jsonDetails = json.loads(repair_json(details));

    responseDict = {
        "answer": answer,
        "details": jsonDetails,
        "img": {"source": imgSource, "height": imgHeight, "width": imgWidth}
    }
    
    return responseDict

#Generate question endpoint.
@app.route('/seed_gen/<string:seed>', methods=['GET'])
def seed_gen(seed):
    searchData = getArticles(hashed(seed)[0] + hashed(seed)[1])#Get articles from Wikipedia, based on a random search
    imgSource = ""
    imgHeight = 0
    imgWidth = 0
  # Keep trying until we get an image
    while True:
        pageid = searchData["query"]["search"][int(hashed(seed), 16) % maxResultSet]["pageid"]

        imageData = getImage(pageid)

        # Use dict.get method to avoid KeyError if 'thumbnail' or 'source' is not present
        imgSource = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("source")
        imgHeight = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("height")
        imgWidth = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("width")

        if imgSource is not None:
            break

    articleData = getData(pageid)
    data = articleData["query"]["pages"][str(pageid)]["extract"]
    answer = articleData["query"]["pages"][str(pageid)]["title"]

    example_json = {
        "question": "",
        "category": "",
        "funFact": "",
        "hints": {
            "hint1": "",
            "hint2": "",
            "hint3": "",
        }
    }
    
    while True:#GPT question prompt.
        prompt = "Write a trivia question and three progressively easier hints. The answer to the question MUST clearly be " + answer + " (even if it is a sentence). Do not say the answer in the question or hints. Add the trivia category, and a fun fact. If the answer is a type of list include \"(a list)\" in the question. Here is some background info: " + data

        details = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type":"json_object"},
            messages=[
                {"role":"system", "content": "Provide output in valid JSON and in English. The data schema should be like this: " + json.dumps(example_json)},
                {"role": "user", "content": prompt}
            ]
        )

        details = details.choices[0].message.content


        if repair_json(details) != "":
            break

    jsonDetails = json.loads(repair_json(details));

    responseDict = {
        "answer": answer,
        "details": jsonDetails,
        "img": {"source": imgSource, "height": imgHeight, "width": imgWidth}
    }
    
    return responseDict

#Get Wikipedia articles
def getArticles(seed):
    params = {
    "action": "query",
    "format": "json",
    "list": "search",
    "utf8": "1",
    "formatversion": "2",
    "srsearch": seed,
    "srqiprofile": "popular_inclinks_pv",
    "srlimit": maxResultSet
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data

#Get Wikipedia articles
def getArticlesTEST():
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": "Category:Countries in Europe",
        "cmlimit": 50
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data
#Get image for particular article
def getImage(pageid):
    params = {
    "action": "query",
    "prop": "pageimages",
    "format": "json",
    "pageids": pageid,
    "pithumbsize": "500"
    }
    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data
#Get exerpt data for particular article
def getData(pageid):
    params = {
    "format": "json",
    "action": "query",
    "prop": "extracts",
    "exintro": "",
    "explaintext": "",
    "redirects": "1",
    "pageids": pageid,
    }
    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data