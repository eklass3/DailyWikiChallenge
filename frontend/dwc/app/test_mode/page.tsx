'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import AnswerBar from '../components/answerBar';
import LinkBarItem from '../components/linkbarItem';
import CategoryInit from '../components/categoryInit';
import axios from 'axios';

const date = new Date();
const day = date.getDate();
const month = date.toLocaleString('default', { month: 'long' });
const year = date.getFullYear();

const initialCatModel : Array<{"category":String, "avgScore": number}>= []

const initialAnswerModel : Array<String> = []

const percentageTopCat = 0.25;
const minToUseModel = 30;

let catModel : Array<{"category":String, "avgScore": number}>= []

let answerModel : Array<String> = []

function calculateHeight(originalWidth: number, originalHeight: number): number {
  const newWidth: number = 250;
  const ratio: number = originalHeight / originalWidth;
  const newHeight: number = newWidth * ratio;
  return newHeight;
}

function generateRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function Home() {
  const [hintLevel, setHintLevel] = useState(0);
  const [answerState, setAnswerState] = useState(0); //0: neutral (startup), 1: correct answer, -1: incorrect answer
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [devMode, setDevMode] = useState(false);
  const [modelsClear, setModelsClear] = useState(false);
  const [question, setQuestion] = useState({
    'answer': 'George V', 
    'category': {"ns": "", "title": ""},
    'details': 
      {'question': 
        'Who was the King of the United Kingdom and Emperor of India from 1910 until his death in 1936?', 
        'category': 'British History', 
        'hints': 
          {'hint1': 
            "He was born as the second son of the Prince and Princess of Wales and became king-emperor after his father's death.", 
            'hint2': 'He was the first monarch of the House of Windsor, which he renamed from the House of Saxe-Coburg and Gotha due to anti-German public sentiment.', 
            'hint3': 'He suffered from smoking-related health problems during his later reign and was succeeded by his eldest son, Edward VIII, who later abdicated.'
          }, 
        'difficulty': 
        'medium',
        'funFact': 'George also liked playing Minecraft in his free time. He was a top 10 all-time player of Super-Smash-Mobs on Mineplex.',
      }, 
      'img': 
        { 'source': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/King_George_1923_LCCN2014715558_%28cropped%29.jpg/500px-King_George_1923_LCCN2014715558_%28cropped%29.jpg', 
          'height': 705, 
          'width': 500
        }
});

   useEffect(()=>{
    loadCatModel();
    loadAnswerModel();
    loadQuestion();
  }, [])

  const loadCatModel = () => {
    const catModelData = localStorage.getItem("catModel")
    if (catModelData !== null) {
      catModel = JSON.parse(catModelData);
    } else {
      catModel = initialCatModel;
    }
  }

  const loadAnswerModel = () => {
    const answerModelData = localStorage.getItem("answerModel")
    if (answerModelData !== null) {
      answerModel = JSON.parse(answerModelData);
    } else {
      answerModel = initialAnswerModel;
    }
  }

  const showHint = () => {
    setHintLevel(hintLevel + 1);
  }

  const scoreCalculator = () => {
    if (hintLevel === 0)
      return 5;
    else if (hintLevel === 1)
      return 3;
    else if (hintLevel === 2)
      return 2;
    else
      return 1;
  }

  const onAnswerSubmit = (value: string) => {
    if (value.toLowerCase().trim() === question.answer.toLowerCase()) {
      setAnswerState(1);
      setScore(score + scoreCalculator());
    } else {
      setAnswerState(-1);
      setHearts(hearts - 1);
    }
  }

  const loadQuestion = async () => {
    console.log("Loading QUESTION")
    try {
      if (catModel.length > minToUseModel) {
        // Sort array in descending order based on avgScore
        catModel.sort((a, b) => (b.avgScore as number) - (a.avgScore as number));

        // Select the top 25%
        let topCats = catModel.slice(0, Math.ceil(catModel.length * percentageTopCat));
        const category = topCats[Math.floor(Math.random() * topCats.length)].category;

        const article = answerModel[Math.floor(Math.random() * answerModel.length)];
        console.log("Loading from test mode option.");
        const res = await axios.get(`./api/question_test?category=${category}&article=${article}`);
        console.log(res.data);
        setQuestion(res.data);
      } else {
          const seed = generateRandomString(6);
          console.log("loading from daily option. Seed: " + seed);
          const res = await axios.get(`./api/question_daily?seed=${generateRandomString(6)}`);
          console.log(res.data);
          setQuestion(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateModels = () => {
    let score = 5;
    if (answerState === 2) {
      score = 0;
    } else {
      switch (hintLevel) {
        case 0:
            if (answerState === 1)
              score = 10;
            else
              score = 0;
          break;
        case 1:
          if (answerState === 1)
            score = 8;
          else
            score = 0;
          break;
        case 2:
          if (answerState === 1)
            score = 5;
          else
            score = 1;
          break;
        case 3:
          if (answerState === 1)
            score = 4;
          else
            score = 0;
          break;
      }
    }
    if (answerState === 1 || answerModel.length === 0) {
      answerModel.push(question.answer);
      if (answerModel.length >= 25)
          answerModel.shift();
    }
    
    localStorage.setItem("answerModel", JSON.stringify(answerModel));

    let found = false;
    for (let i = 0; i < catModel.length; i++) {
      if (catModel[i].category === question.category.title) {
        catModel[i].avgScore = 0.9 * (catModel[i].avgScore as number) + 0.1 * score;
        found = true;
        break;
      }
    }

    if (!found) {
      catModel.push({ category: question.category.title, avgScore: score });
    }
    localStorage.setItem("catModel", JSON.stringify(catModel));

    console.log(catModel);
    console.log(answerModel);
  }

  const clearModels = () => {
     catModel = []
     answerModel = []
     localStorage.setItem("catModel", "");
     localStorage.setItem("answerModel", "");
     setModelsClear(true);
  }

  const skipQuestion = () => {
    setAnswerState(2);
    if (score > 0)
      setScore(score - 1);
  }

  return (
    <main className="container">
      <div className="center-div">
        <div style={{display: "flex"}}>
          <div style={{flex: 1}}/>
        </div>
        <div style={{display: "flex"}}>
          <h1 className="title">Daily Wiki Challenge</h1>
          <div style={{flex: 1}}/>
          <p style={{marginTop: 30, marginBottom: 0, whiteSpace: "nowrap"}}><b>⭐: </b>{score} <b>❤️:</b> {hearts}</p>
        </div>
        <div className="line"/>
        <div style={{display: "flex"}}>
          <p className="small-text">{`${day} ${month} ${year}`}</p>
          <p style={{marginBottom: -15, fontSize: 14, marginLeft: 15}}><a href={`/about`} target="_blank">About DWC</a></p>
          <div style={{display: "flex", alignItems: "center", marginLeft: 15}}>
            <input type="checkbox" checked={devMode} onChange={()=>{setDevMode(!devMode)}}/>
            <p style={{fontSize: 14}}>Dev Mode</p>
          </div>
          <div style={{flex: 1}}/>
          <LinkBarItem link={"/"} selected={false} text={"Daily Challenge"}/>
          <LinkBarItem link={"/test_mode"} selected={true} text={"Test Mode (Beta)"}/>
        </div>
        <div className="light-line"></div>
        {loading && <p>Crafting Question...</p>}
        {!loading &&
        <div className="question-container">
          <p>{question.details.question}</p>
          {hintLevel < 3 && <button className="link-button" onClick={showHint}>Hint ({3-hintLevel})</button>}
          {hintLevel >= 1 && <p><b>Hint 1:</b> {question.details.hints.hint1}</p>}
          {hintLevel >= 2 && <p><b>Hint 2:</b> {question.details.hints.hint2}</p>}
          {hintLevel >= 3 && <p><b>Hint 3:</b> {question.details.hints.hint3}</p>}
          {question.img.source !== null &&
          <div className="image-container">
            <Image 
              src={question.img.source} 
              alt="Question Image"
              width={250}
              height={calculateHeight(question.img.width, question.img.height)}
            />
          </div>}
          <div className="content">
              {answerState < 1 && hearts > 0 && 
              <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <AnswerBar onAnswerSubmit={onAnswerSubmit}/>
                <button 
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    padding: '10px 15px',
                    fontSize: '14px',
                    color: '#222',
                    marginTop: 15,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onClick={()=>skipQuestion()}
                  >
                  <b>Skip ⭐</b>
        </button>
              </div>}
              {answerState === -1 && hearts > 0 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15}}>
                <div className="highlighter-incorrect">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Try Again.</b></p>
                </div>
                </div>}
                {answerState === -1 && hearts == 0 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15}}>
                <div className="highlighter-negative">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Game over!</b></p>
                </div>
                <p>The correct answer was: <a href={`https://en.wikipedia.org/wiki/${question.answer.replace(/ /g, "_")}`} target="_blank">{question.answer}</a><br/>Your score <b>⭐: </b>{score}</p>
                <button style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    padding: '10px 15px',
                    fontSize: '14px',
                    color: '#222',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onClick={()=>{
                    updateModels();
                    setLoading(true);
                    setHintLevel(0);
                    setAnswerState(0);
                    setHearts(3);
                    setScore(0);
                    loadQuestion(); }}><b>Play Again</b></button>
                </div>}
                {answerState === 2 &&
                  <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <div className="highlighter-incorrect">
                      <p style={{marginTop: 5, marginBottom: 5}}><b>The correct answer was: <a href={`https://en.wikipedia.org/wiki/${question.answer.replace(/ /g, "_")}`} target="_blank">{question.answer}</a></b></p>
                    </div>
                    <p style={{textAlign: "center"}}><b>Fun-Fact: </b>{question.details.funFact}</p>
                  <button style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    padding: '10px 15px',
                    fontSize: '14px',
                    color: '#222',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onClick={()=>{
                    updateModels();
                    setLoading(true);
                    setHintLevel(0);
                    setAnswerState(0);
                    loadQuestion(); }}><b>Next Question</b></button>
                  </div>
                }
              {answerState === 1 && <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div className="highlighter-correct">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Correct!</b></p>
                </div>
                <p><b>Fun-Fact: </b>{question.details.funFact}</p>
                <a href={`https://en.wikipedia.org/wiki/${question.answer.replace(/ /g, "_")}`} target="_blank"><p>Read More</p></a>
                <button 
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #a2a9b1',
            borderRadius: '2px',
            padding: '10px 15px',
            fontSize: '14px',
            color: '#222',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onClick={()=>{
            updateModels();
            setLoading(true);
            setHintLevel(0);
            setAnswerState(0);
            loadQuestion();
          }}
        >
          <b>Next Question</b>
        </button>
              </div>}
              {devMode &&
                <div>
                  <h2>Dev Mode Details</h2>
                  <button onClick={()=>clearModels()}>Clear Model</button>
                  <p><b>Categories selected:</b> {JSON.stringify(question.category.title)}</p>
                  {!modelsClear &&
                  <div>
                    <p><b>Category Model:</b> {JSON.stringify(catModel)}</p>
                    <p><b>Answer Model:</b> {JSON.stringify(answerModel)}</p>
                  </div>
                  }
                  {modelsClear &&
                    <div>
                    <p><b>Category Model: []</b></p>
                    <p><b>Answer Model: []</b></p>
                  </div>
                  }
                </div>
              }
          </div>
        </div>
        }
      </div>
    </main>
  );
}
