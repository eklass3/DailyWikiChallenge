from flask import Flask, request
from g4f.client import Client
from json_repair import repair_json
from datetime import datetime, timedelta
import json, requests, random, string
import hashlib
import os

app = Flask(__name__)

client = Client()#GPT client

wikiUrl = "https://en.wikipedia.org/w/api.php"#Wikipedia API URL
maxResultSet = 100 #Max number of results from search set.

chanceOfSelectingExistingCategory = 0.3
chanceOfSelectingPopCategory = 0.5

import hashlib

def stringToNumber(seed, limit):
    # Get the hash of the string
    hashed_seed = int(hashlib.sha256(seed.encode()).hexdigest(), 16)

    # Convert the hash to a number between 0 and limit
    number = hashed_seed % limit

    return number

def generate_random_string():
    length = random.randint(0, 4)
    letters = string.ascii_letters
    result_str = ''.join(random.choice(letters) for _ in range(length))
    return result_str

def percentRandom(percentage):
    return random.random() < percentage

def removeItemsWithColon(json_array):
    # Use a list comprehension to filter out items with a colon in the "article" parameter
    filtered_json_array = [item for item in json_array if ":" not in item["article"]]
    return filtered_json_array

#Generate question endpoint.
# @app.route('/generate/<string:category>/<string:recentArticle>', methods=['GET'])
# def generate(category, recentArticle):

    try:
        quizCategory = ""
        article = {"title": "", "pageid": 0}
        if (percentRandom(chanceOfSelectingExistingCategory)):
            quizCategory = category
            data = getArticles(quizCategory)
            art = random.choice(data["query"]["categorymembers"])
            article["title"] = art["title"]
            article["pageid"] = art["pageid"]
        else:
            if (percentRandom(chanceOfSelectingPopCategory)):
                return seed_gen(generate_random_string())
            else:
                data = getRelatedArticle(recentArticle)
                article = {"title": data["article"], "pageid": data["pageid"]}
                quizCategory = data["category"] 


        imageData = getThumbnailImage(article["pageid"])
        print(imageData)
        # Use dict.get method to avoid KeyError if 'thumbnail' or 'source' is not present
        imgSource = imageData["query"]["pages"][str(article["pageid"])].get("thumbnail", {}).get("source")
        imgHeight = imageData["query"]["pages"][str(article["pageid"])].get("thumbnail", {}).get("height")
        imgWidth = imageData["query"]["pages"][str(article["pageid"])].get("thumbnail", {}).get("width")

        articleData = getData(article["pageid"])
        data = articleData["query"]["pages"][str(article["pageid"])]["extract"]
        answer = article["title"]

        example_json = {
            "question": "",
            "funFact": "",
            "hints": {
                "hint1": "",
                "hint2": "",
                "hint3": "",
            }
        }
        
        while True:#GPT question prompt.
            prompt = "Write a trivia question and three progressively easier hints, where this is the answer " + answer + ". Do not say the answer in the question or hints. Add the trivia category, and a fun fact. Here is some background info: " + data

            details = client.chat.completions.create(
                model="gpt-3.5-turbo",
                response_format={"type":"json_object"},
                messages=[
                    {"role":"system", "content": "Provide output in valid JSON and in English. The data schema should be like this: " + json.dumps(example_json)},
                    {"role": "user", "content": prompt}
                ]
            )

            details = details.choices[0].message.content

            print(details)

            if repair_json(details) != "":
                break

        jsonDetails = json.loads(repair_json(details))

        responseDict = {
            "answer": answer,
            "category": {"title": quizCategory.replace("_", " ")},
            "details": jsonDetails,
            "img": {"source": imgSource, "height": imgHeight, "width": imgWidth}
        }

        #print(responseDict)
        if (len(jsonDetails) > 0 and (":" not in answer) and jsonDetails["question"] != "" and ("List of" not in answer) and ("Index of" not in answer)):
            return responseDict
        else:
            return generate(category, recentArticle)
        
    except KeyError:
        return generate(category, recentArticle)

#Generate question endpoint.
@app.route('/seed_gen/<string:seed>', methods=['GET'])
def seed_gen(seed):

    try:
        popArticle = getPopularArticle(seed)#Get articles from Wikipedia, based on a random search
        imgSource = ""
        imgHeight = 0
        imgWidth = 0

        data = getPageID(popArticle["article"])
        parents = getParent(popArticle["article"])["query"]["pages"]
        startingArtId = list(parents.keys())[0]
        jParCats = parents[startingArtId]["categories"]

        categories = random.sample(jParCats, 3)
        # Navigate to the pageid field
        pageid = next(iter(data["query"]["pages"].values()))["pageid"]

        imageData = getThumbnailImage(pageid)
        print(imageData)
        # Use dict.get method to avoid KeyError if 'thumbnail' or 'source' is not present
        imgSource = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("source")
        imgHeight = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("height")
        imgWidth = imageData["query"]["pages"][str(pageid)].get("thumbnail", {}).get("width")

        articleData = getData(pageid)
        data = articleData["query"]["pages"][str(pageid)]["extract"]
        answer = articleData["query"]["pages"][str(pageid)]["title"]

        example_json = {
            "question": "I am a famous scientist known for my work in physics.",
            "funFact": "Albert Einstein developed the theory of relativity, which revolutionized our understanding of space, time, and energy.",
            "hints": {
                "hint1": "I was born in Germany in 1879.",
                "hint2": "My most famous equation is E=mc².",
                "hint3": "I received the Nobel Prize in Physics in 1921 and my name is often associated with genius."
            }
        }
        
        while True:#GPT question prompt.
            prompt = "Write a trivia question and three progressively easier hints, where this is the answer " + answer + ". Do not say the answer in the question or hints. Add the trivia category, and a fun fact. Here is some background info: " + data

            details = client.chat.completions.create(
                model="gpt-4o",
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
            "categories": {"category1": categories[0]["title"], "category2": categories[1]["title"], "category3": categories[2]["title"]},
            "details": jsonDetails,
            "img": {"source": imgSource, "height": imgHeight, "width": imgWidth}
        }
        
        print(responseDict)
        if (len(jsonDetails) > 0 and (":" not in answer) and jsonDetails["question"] != "" and ("List of" not in answer) and ("Index of" not in answer)):
            return responseDict
        else:
            return seed_gen(seed + "a")#Try a new seed.
        
    except KeyError:
        return seed_gen(seed)#Error loading data, retry.
#Get Wikipedia articles for a given category
def getArticles(category):
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": category,
        "cmtype": "page",
        "cmlimit": 500
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data

def getPopularArticle(seed):
    try:
        current_date = datetime.strptime(seed, '%Y%m%d')
    except ValueError:
        current_date = datetime.now()
    # Subtract one day
    one_day_ago = current_date - timedelta(days=2)  

    strYesterday = one_day_ago.strftime('%Y/%m/%d')
    url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/" + strYesterday
    
    headers = {
        "User-Agent": "eaklassen8",
    }

    response = requests.get(url, headers=headers)
    data = response.json()

    # Get the list of articles
    articles = data['items'][0]['articles']
    articles = removeItemsWithColon(articles)

    return articles[stringToNumber(seed, len(articles))]

#Get Wikipedia parent category for a given category
def getParent(category):
    params = {
        "action": "query",
        "format": "json",
        "prop": "categories",
        "titles": category,
        "clshow": "!hidden",
        "cmlimit": 500
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data

#Get Wikipedia sub categories for a given category
def getChild(category):
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": category,
        "cmtype": "subcat"
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data
#Get Wikipedia pageid from page title
def getPageID(pageTitle):
    params = {
        "action": "query",
        "format": "json",
        "prop": "info",
        "titles": pageTitle,
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data

def getThumbnailImage(pageid):
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

def getRelatedArticle(startingArt):
    parents = getParent(startingArt)["query"]["pages"]
    startingArtId = list(parents.keys())[0]
    jParCats = parents[startingArtId]["categories"]

    randomParCat = random.choice(jParCats)
    data = getArticles(randomParCat["title"])
    art = random.choice(data["query"]["categorymembers"])
    title = art["title"]
    pageid = art["pageid"]
    return {"category": randomParCat["title"], "article": title, "pageid": pageid}

if __name__ == '__main__':
   app.run(port=int(os.environ.get("PORT", 8080)),host='0.0.0.0',debug=True)