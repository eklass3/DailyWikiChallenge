import json, requests, random, string
wikiUrl = "https://en.wikipedia.org/w/api.php"#Wikipedia API URL

percentageOfTopCategories = 0.50
chanceOfSelectingExistingCategory = 0.8


def percentRandom(percentage):
    return random.random() < percentage


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

def getImages(pageTitle):
    params = {
        "action": "query",
        "format": "json",
        "prop": "images",
        "titles": pageTitle,
    }   

    response = requests.get(wikiUrl, params=params)
    data = response.json()
    return data


def runCrawl(startingCat):
    return crawlSubCat(startingCat)


def crawlSubCat(startingCat):
    jSubCats = getChild(startingCat)["query"]["categorymembers"]

    if (len(jSubCats) > 0):
        randomSubCat = random.choice(jSubCats)

        jSubCatArticles = getArticles(randomSubCat["title"])["query"]["categorymembers"]

        if len(jSubCatArticles) >= 5:
            randomArticle = random.choice(jSubCatArticles)
            randomArticleTitle = randomArticle["title"]

            # Check if the article has an image and doesn't contain 'List of'
            if 'List of' not in randomArticleTitle:
                jImagesData = getImages(randomArticleTitle)["query"]["pages"]
                pageId = list(jImagesData.keys())[0]
                if 'images' in jImagesData[pageId]:
                    return randomArticleTitle
                
            return crawlSubCat(randomSubCat["title"])
        else:
            return crawlSubCat(randomSubCat["title"])
    else:
        return crawlParentCat(startingCat)

def crawlParentCat(startingCat):
    jParPagesData = getParent(startingCat)["query"]["pages"]
    startingCatId = list(jParPagesData.keys())[0]
    jParCats = jParPagesData[startingCatId]["categories"]

    randomParCat = jParCats[random.randint(0, len(jParCats)-1)]

    return crawlSubCat(randomParCat["title"])


def getRelatedArticle(startingArt):
    parents = getParent(startingArt)["query"]["pages"]
    startingArtId = list(parents.keys())[0]
    jParCats = parents[startingArtId]["categories"]

    randomParCat = random.choice(jParCats)
    data = getArticles(randomParCat["title"])
    print("TESTING NEW CATEGORY")
    return {"category": randomParCat["title"], "article": random.choice(data["query"]["categorymembers"])["title"]}
    

with open('catModel.json', 'r') as f:
    catModel = json.load(f)

with open('rightAnswersQueue.json', 'r') as fa:
        answersQueue = json.load(fa)

# Sort categories by score and select the top 75%
catModel.sort(key=lambda x: x['avgScore'], reverse=True)
topCats = catModel[:int(len(catModel) * percentageOfTopCategories)]

quizCategory = ""
article = ""
if (percentRandom(chanceOfSelectingExistingCategory)):
    quizCategory = random.choice(topCats)["category"]
    data = getArticles(quizCategory)
    article = random.choice(data["query"]["categorymembers"])["title"]
    print(article)
else:
    data = getRelatedArticle(random.choice(answersQueue))
    article = data["article"]
    print(article)
    quizCategory = data["category"]
    
score = random.randint(0, 10)

print(quizCategory)

if score > 3:
    answersQueue.append(article)
    answersQueue.pop(0)
    with open('rightAnswersQueue.json', 'w') as fa:
        json.dump(answersQueue, fa)

# Find category and update score
for item in catModel:
    if item['category'] == quizCategory:
        item['avgScore'] = 0.9 * item['avgScore'] + 0.1 * score
        break
else:
    catModel.append({"category": quizCategory, "avgScore": score})
    

with open('catModel.json', 'w') as f:
    json.dump(catModel, f)

