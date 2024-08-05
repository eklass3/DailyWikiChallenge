'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import AnswerBar from './components/answerbar';
import LinkBarItem from './components/linkbarItem';
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
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
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
    const stateInfo = localStorage.getItem("stateInfo");//Get saved state info.

    /*
    {
      "lastDC":  0000000,
      "hintLevel": 0
      "streak": 0
      "score": 0
      "answerState": 0
    }
    */

    if (stateInfo != null) {//If the app has been opened before.
      const jStateInfo = JSON.parse(stateInfo);
      const lastDC = jStateInfo.lastDC;
      setScore(jStateInfo.score);//The score has not changed. Set score.

      console.log("STATE INFO " + stateInfo);
      let tempStreak = 0;
      let tempAnswerState = 0;
      let tempHintLevel = 0;
      //If one day has passed or it is the same day (keep streak)
      if (isOneDayLater(lastDC, new Date().getTime()) || isSameDay(lastDC, new Date().getTime())) {
        setStreak(jStateInfo.streak);//Set streak to what is was before
        tempStreak = jStateInfo.streak;

        if (isOneDayLater(lastDC, new Date().getTime())) {//If one day later, reset answer and hint states.
          setAnswerState(0);
          tempAnswerState = 0;

          setHintLevel(0);
          tempHintLevel = 0;
        } else {//Same day, keep answer and hint states
          setAnswerState(jStateInfo.answerState);
          tempAnswerState = jStateInfo.answerState;

          setHintLevel(jStateInfo.hintLevel);
          tempHintLevel = jStateInfo.hintLevel;
        }
      } else {//Several days have passed. Reset streak, answer state, hint level.
        setStreak(0);
        tempStreak = 0;
        tempAnswerState = 0;
        tempHintLevel = 0;
      }

      //Update state info.
      const newStateInfo = {
        "lastDC": lastDC,//Streak has not be extended.
        "hintLevel": tempHintLevel,//Set hint level
        "streak": tempStreak,//Set streak
        "score": jStateInfo.score,//Score stays same
        "answerState": tempAnswerState//Set answer state
      }

      localStorage.setItem("stateInfo", JSON.stringify(newStateInfo));

    } else {//Never played game before
      const newStateInfo = {
        "lastDC": new Date().getTime(),//Set new DC
        "hintLevel": 0,
        "streak": 0,
        "score": 0,
        "answerState": 0,
      }

      localStorage.setItem("stateInfo", JSON.stringify(newStateInfo));
    }
  }, [])

  const showHint = () => {
    setHintLevel(hintLevel + 1);

    const stateInfo = localStorage.getItem("stateInfo");//Must update hints in local storage.

    if (stateInfo != null) {//State should never be null at this point.

      const jStateInfo = JSON.parse(stateInfo);

      const newStateInfo = {
        "lastDC": jStateInfo.lastDC,
        "hintLevel": hintLevel+1,//Hin level incremented by 1.
        "streak": jStateInfo.streak,
        "score": jStateInfo.score,
        "answerState": jStateInfo.answerState,
      }

      localStorage.setItem("stateInfo", JSON.stringify(newStateInfo))
    }
  }

  function isOneDayLater(date1Millis: number, date2Millis: number): boolean {
    const date1 = new Date(date1Millis);
    const date2 = new Date(date2Millis);

    const day1 = date1.getUTCDate();
    const month1 = date1.getUTCMonth();
    const year1 = date1.getUTCFullYear();

    const day2 = date2.getUTCDate();
    const month2 = date2.getUTCMonth();
    const year2 = date2.getUTCFullYear();

    // Check if the years are the same
    if (year1 === year2) {
        // If the years are the same, check if the months are the same
        if (month1 === month2) {
            // If the months are the same, check if the days are consecutive
            return day2 - day1 === 1;
        } else {
            // If the months are different, they must be consecutive and the day of date2 must be the first day of the month
            return month2 - month1 === 1 && day2 === 1;
        }
    } else {
        // If the years are different, they must be consecutive, the day of date2 must be the first day of the year, and the month of date2 must be January
        return year2 - year1 === 1 && month2 === 0 && day2 === 1;
    }
}

function isSameDay(date1Millis: number, date2Millis: number): boolean {
  const date1 = new Date(date1Millis);
  const date2 = new Date(date2Millis);

  // Check if the years, months, and days are the same
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate();
}

function getFormattedSeedDate(): string {
  const date = new Date();
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
  const year = date.getFullYear().toString().slice(2); // Get the last two digits of the year
  
  return day + month + year;
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
    if (value.toLowerCase().trim() === question.answer.toLowerCase()) {//If the answer is correct.
      setAnswerState(1);//Set answer state to correct.

        const stateInfo = localStorage.getItem("stateInfo");

        if (stateInfo !== null) {//State should never be null at this point

          const jStateInfo = JSON.parse(stateInfo);
          //Initializing variables.
          let newDC =  jStateInfo.lastDC;
          let newStreak = jStateInfo.streak;
          let newScore = jStateInfo.score;

          if (isOneDayLater(jStateInfo.lastDC, new Date().getTime())) {//If one day has passed
            newDC = new Date().getTime();//Update DC
            newStreak = jStateInfo.streak + 1;//Increase streak
            setStreak(newStreak);//Update streak state
          }

          newScore = score + scoreCalculator();//Regardless of date/streak increase score
          setScore(score + scoreCalculator());//Set score state
          //Update state level
          const newStateInfo = {
            "lastDC": newDC,
            "hintLevel": hintLevel,//Hint stays same
            "streak": newStreak,
            "score": newScore,
            "answerState": 1
          }
    
          localStorage.setItem("stateInfo", JSON.stringify(newStateInfo));

          console.log("NEW STATE INFO " + JSON.stringify(newStateInfo));

      }
      
    } else {
      setAnswerState(-1);
    }
  }

  const loadQuestion = async () => {
    try {
      const res = await axios.get(`./api/question_daily?seed=${getFormattedSeedDate()}`);
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
          <p style={{marginTop: 30, marginBottom: 0, whiteSpace: "nowrap"}}><b>⭐:</b> {score} <b>🔥:</b> {streak}</p>
        </div>
        <div className="line"/>
        <div style={{display: "flex"}}>
        <p className="small-text">{`${day} ${month} ${year}`}</p>
        <div style={{flex: 1}}/>
          <LinkBarItem link={"/"} selected={true} text={"Daily Challenge"}/>
          <LinkBarItem link={"/test_mode"} selected={false} text={"Test Mode"}/>
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
              {answerState !== 1 && <AnswerBar onAnswerSubmit={onAnswerSubmit}/>}
              {answerState === -1 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 15}}>
                <div className="highlighter-incorrect">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Try Again.</b></p>
                </div>
                </div>}
              {answerState === 1 && <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div className="highlighter-correct">
                  <p style={{marginTop: 5, marginBottom: 5}}><b>Correct!</b></p>
                </div>
                <p><b>Fun-Fact: </b>{question.details.funFact}</p>
                <a href={`https://en.wikipedia.org/wiki/${question.answer.replace(/ /g, "_")}`} target="_blank"><p>Read More</p></a>
                <p>Come back tomorrow for the next daily challenge!</p>
              </div>}
          </div>
        </div>
        }
      </div>
    </main>
  );
}
