'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import AnswerBar from '../components/answerbar';
import LinkBarItem from '../components/linkbarItem';
import axios from 'axios';

const date = new Date();
const day = date.getDate();
const month = date.toLocaleString('default', { month: 'long' });
const year = date.getFullYear();

function calculateHeight(originalWidth: number, originalHeight: number): number {
  const newWidth: number = 250;
  const ratio: number = originalHeight / originalWidth;
  const newHeight: number = newWidth * ratio;
  return newHeight;
}

export default function Home() {
  const [hintLevel, setHintLevel] = useState(0);
  const [answerState, setAnswerState] = useState(0); //0: neutral (startup), 1: correct answer, -1: incorrect answer
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [question, setQuestion] = useState({
    'answer': 'George V', 
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
    loadQuestion();
  }, [])

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
    if (value === question.answer) {
      setAnswerState(1);
      setScore(score + scoreCalculator());
    } else {
      setAnswerState(-1);
      setHearts(hearts - 1);
    }
  }

  const loadQuestion = async () => {
    try {
      const res = await axios.get(`./api/question_test`);
      console.log(res.data);
      setQuestion(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <div className="center-div">
        <div style={{display: "flex"}}>
          <h1 className="title">Daily Wiki Challenge</h1>
          <div style={{flex: 1}}/>
          <p style={{marginTop: 30, marginBottom: 0, whiteSpace: "nowrap"}}><b>⭐: </b>{score} <b>❤️:</b> {hearts}</p>
        </div>
        <div className="line"/>
        <div style={{display: "flex"}}>
          <p className="small-text">{`${day} ${month} ${year}`}</p>
          <div style={{flex: 1}}/>
          <LinkBarItem link={"/"} selected={false} text={"Daily Challenge"}/>
          <LinkBarItem link={"/test_mode"} selected={true} text={"Test Mode"}/>
        </div>
        <div className="light-line"></div>
        {loading && <p>Loading Question...</p>}
        {!loading &&
        <div className="question-container">
          <p>{question.details.question}</p>
          {hintLevel < 3 && <button className="link-button" onClick={showHint}>Hint ({3-hintLevel})</button>}
          {hintLevel >= 1 && <p><b>Hint 1:</b> {question.details.hints.hint1}</p>}
          {hintLevel >= 2 && <p><b>Hint 2:</b> {question.details.hints.hint2}</p>}
          {hintLevel >= 3 && <p><b>Hint 3:</b> {question.details.hints.hint3}</p>}
          <div className="image-container">
            <Image 
              src={question.img.source} 
              alt="Question Image"
              width={250}
              height={calculateHeight(question.img.width, question.img.height)}
            />
          </div>
          <div className="content">
              {answerState !== 1 && hearts > 0 && <AnswerBar onAnswerSubmit={onAnswerSubmit}/>}
              {answerState === -1 && hearts > 0 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15}}>
                <div className="highlighter-incorrect">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Try Again.</b></p>
                </div>
                </div>}
                {answerState === -1 && hearts == 0 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15}}>
                <div className="highlighter-negative">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Game over!</b></p>
                </div>
                <p>The correct answer was: <b>{question.answer}</b><br/>Your score <b>⭐: </b>{score}</p>
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
            setLoading(true);
            setHintLevel(0);
            setAnswerState(0);
            setHearts(3);
            setScore(0);
            loadQuestion();
          }}
        >
          <b>Play Again</b>
        </button>
                </div>}
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
            setLoading(true);
            setHintLevel(0);
            setAnswerState(0);
            loadQuestion();
          }}
        >
          <b>Next Question</b>
        </button>
              </div>}
          </div>
        </div>
        }
      </div>
    </main>
  );
}
