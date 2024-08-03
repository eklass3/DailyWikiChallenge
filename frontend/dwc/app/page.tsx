'use client';
import Image from "next/image";
import { useState } from "react";
import AnswerBar from './answerbar';
import { title } from "process";

const date = new Date();
const day = date.getDate();
const month = date.toLocaleString('default', { month: 'long' });
const year = date.getFullYear();

const question = {
  'answer': 'George V', 
  'fun-fact': 'George also liked playing Minecraft in his free time. He was a top 10 all-time player of Super-Smash-Mobs on Mineplex.',
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
      'medium'
    }, 
    'img': 
      { 'source': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/King_George_1923_LCCN2014715558_%28cropped%29.jpg/500px-King_George_1923_LCCN2014715558_%28cropped%29.jpg', 
        'height': 705, 
        'width': 500
      }
}

function calculateHeight(originalWidth: number, originalHeight: number): number {
  const newWidth: number = 250;
  const ratio: number = originalHeight / originalWidth;
  const newHeight: number = newWidth * ratio;
  return newHeight;
}

export default function Home() {
  const [hintLevel, setHintLevel] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(false);

  const showHint = () => {
    setHintLevel(hintLevel + 1);
  }

  const onAnswerSubmit = (value: string) => {
    setCorrectAnswer(value === question.answer);
  }

  const loadQuestion = () => {
    
  }

  return (
    <main className="container">
      <div className="center-div">
        <h1 className="title">
          Daily Wiki Challenge
        </h1>
        <div className="line"/>
        <p className="date">{`${day} ${month} ${year}`}</p>
        <div className="light-line"></div>
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
              {!correctAnswer && <AnswerBar onAnswerSubmit={onAnswerSubmit}/>}
              {correctAnswer && <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div className="highlighter">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Correct!</b></p>
                </div>
                <p><b>Fun-Fact: </b>{question["fun-fact"]}</p>
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
          onClick={()=>loadQuestion()}
        >
          <b>Next Question</b>
        </button>
              </div>}
          </div>
        </div>
      </div>
    </main>
  );
}
