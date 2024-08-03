from flask import Flask, request
from g4f.client import Client
from json_repair import repair_json
import json, requests, random, string

app = Flask(__name__)

client = Client()#GPT client

wikiUrl = "https://en.wikipedia.org/w/api.php"#Wikipedia API URL
maxResultSet = 50 #Max number of results from search set.

#Generate question endpoint.
@app.route('/generate', methods=['GET'])
def generate():
    searchData = getArticles(random.choice(string.ascii_letters) + random.choice(string.ascii_letters))#Get articles from Wikipedia, based on a random search
    imgSource = ""
    imgHeight = 0
    imgWidth = 0
  # Keep trying until we get an image
    while True:
        pageid = searchData["query"]["search"][random.randint(0, maxResultSet-1)]["pageid"]

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
        "fun-fact": "",
        "hints": {
            "hint1": "",
            "hint2": "",
            "hint3": "",
        }
    }
    
    while True:#GPT question prompt.
        prompt = "Write a trivia question and three progressively easier hints, where this is the answer " + answer + ". Do not include the answer in the question. Add the trivia category, a fun fact, and the difficulty of the question (easy, medium, hard). Here is some background info: " + data

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

    responseDict = {
        "answer": answer,
        "details": json.loads(repair_json(details)),
        "img": {"source": imgSource, "height": imgHeight, "width": imgWidth}
    }
    
    return str(responseDict)
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