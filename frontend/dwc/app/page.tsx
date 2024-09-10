'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import AnswerBar from './components/answerBar';
import HintBox from './components/hintBox';
import MobileMenuBar from './components/MobileMenuBar';
import MenuBar from './components/MenuBar';
import { db } from '../lib/firebaseConfig';
import { getAccountStats , updateAccountStats, createAccountStats } from '../utils/firebaseAccountHelpers'
import { collection, getDocs, updateDoc, getDoc, query, where, doc, addDoc } from "firebase/firestore";
import axios from 'axios';

const date = new Date();
const day = date.getDate();
const month = date.toLocaleString('default', { month: 'long' });
const year = date.getFullYear();

function calculateHeight(originalWidth: number, originalHeight: number, newWidth : number): number {
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
  const [mobile, setMobile] = useState(window.innerWidth < 1000 ? true : false);
  const [question, setQuestion] = useState({
    'answer': 'George V', 
    'categories': {"category1": "", "category2": "", "category3": ""},
    'details': 
      {'question': 
        'Who was the King of the United Kingdom and Emperor of India from 1910 until his death in 1936?', 
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

  const handleResize = () => {
    setMobile(window.innerWidth < 1000 ? true : false);
  };

  // Attach the event listener
  window.addEventListener('resize', handleResize);

  const fetchAccountData = async () => {
    const documentId = localStorage.getItem('userDocumentId');

    try {
      if (documentId) {
        const data = await getAccountStats(documentId);

        if (data) {
          const lastCorrectDateMillis = data.lastCorrect ? new Date(data.lastCorrect).getTime() : 0;
          const currentDateMillis = new Date(toLocalISOString(new Date())).getTime();

          console.log("is one day later returns: " + isOneDayLater(lastCorrectDateMillis, currentDateMillis));
          console.log("is same day returns: " + isSameDay(lastCorrectDateMillis, currentDateMillis));

          if (!isSameDay(lastCorrectDateMillis, currentDateMillis)) {//If it is not the same day as you last answered correctly.
            if (isOneDayLater(lastCorrectDateMillis, currentDateMillis)) {//If it is just one day later
              await updateAccountStats(documentId, { answerState: 0, hintLevel: 0 });//Set hint state to 0, set answer state to 0
              setAnswerState(0);
              setHintLevel(0);
              setScore(data.score || 0);
              setStreak(data.streak || 0);
            } else {//More than one day has passed.
              await updateAccountStats(documentId, { answerState: 0, hintLevel: 0, streak: 0 });//Reset answer state, hint level, and streak.
              setAnswerState(0);
              setHintLevel(0);
              setStreak(0);
              setScore(data.score || 0);
            }
          } else {
            setHintLevel(data.hintLevel || 0);
            setAnswerState(data.answerState || 0);
            setScore(data.score || 0);
            setStreak(data.streak);
          }
        }
      } else {
        const newDocumentId = await createAccountStats({
          answerState: 0,
          hintLevel: 0,
          lastCorrect: null,
          score: 0,
          streak: 0,
          timezone: 'UTC'
        });
        localStorage.setItem('userDocumentId', newDocumentId);
      }

      const fetchQuestionData = async () => {
        const q = query(collection(db, "daily-question"), where("date", "==", getUniqueValueForToday()));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => doc.data());

        if (docs.length > 0) {
          // const question = docs[0];
          // setQuestion({
          //   answer: question.answer, 
          //   details: {
          //     question: question.question, 
          //     category: question.category, 
          //     hints: {
          //       hint1: question.hint1, 
          //       hint2: question.hint2, 
          //       hint3: question.hint3,
          //     }, 
          //     difficulty: 'medium',
          //     funFact: question.fun_fact,
          //   }, 
          //   img: {
          //     source: question.img_src, 
          //     height: question.img_h, 
          //     width: question.img_w
          //   }
          // });
          // setLoading(false);
          loadQuestion();
        } else {
          loadQuestion();
        }
      };

      fetchQuestionData();
    } catch (error) {
      console.error('Error fetching or creating account data:', error);
    }
  };

  fetchAccountData();

  // Cleanup the event listener on component unmount
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [])

const showHint = async () => {
  const documentId = localStorage.getItem('userDocumentId');

  if (documentId) {
    setHintLevel(hintLevel + 1);

    try {
      await updateAccountStats(documentId, { hintLevel: hintLevel + 1 });
    } catch (error) {
      console.error('Error updating hint level:', error);
    }
  }
};

function isOneDayLater(date1Millis: number, date2Millis: number): boolean {
  const date1 = new Date(toLocalISOString(new Date(date1Millis)));
  const date2 = new Date(toLocalISOString(new Date(date2Millis)));

  const day1 = date1.getDate();
  const month1 = date1.getMonth();
  const year1 = date1.getFullYear();

  const day2 = date2.getDate();
  const month2 = date2.getMonth();
  const year2 = date2.getFullYear();

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
  const date1 = new Date(toLocalISOString(new Date(date1Millis)));
  const date2 = new Date(toLocalISOString(new Date(date2Millis)));

  // Check if the years, months, and days are the same
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function toLocalISOString(date: Date): string {
  // Extract local date and time components
  const localYear: number = date.getFullYear();
  const localMonth: number = date.getMonth() + 1; // Months are 0-based
  const localDay: number = date.getDate();
  const localHours: number = date.getHours();
  const localMinutes: number = date.getMinutes();
  const localSeconds: number = date.getSeconds();
  const localMilliseconds: number = date.getMilliseconds();

  // Format the date and time components to match the ISO 8601 format
  const formattedDate: string = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
  const formattedTime: string = `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}:${localSeconds.toString().padStart(2, '0')}.${localMilliseconds.toString().padStart(3, '0')}`;

  // Combine date and time
  return `${formattedDate}T${formattedTime}`;
}

function getUniqueValueForToday() {
  const date = new Date();
  const year = date.getFullYear();
  // getMonth() returns month starting from 0, so we add 1 to get the correct month number
  const month = ('0' + (date.getMonth() + 1)).slice(-2); 
  const day = ('0' + date.getDate()).slice(-2);
  return year + month + day;
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

const onAnswerSubmit = async (value: string) => {
  const documentId = localStorage.getItem('userDocumentId');

  if (documentId) {
    if (value.toLowerCase().trim() === question.answer.toLowerCase()) { // If the answer is correct
      setAnswerState(1); // Set answer state to correct

      const newScore = score + scoreCalculator();
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      try {
        await updateAccountStats(documentId, {
          answerState: 1,
          score: newScore,
          streak: newStreak,
          lastCorrect: toLocalISOString(new Date())
        });
      } catch (error) {
        console.error('Error updating answer state:', error);
      }
    } else {
      setAnswerState(-1); // Set answer state to incorrect
    }
  }
};

const loadQuestion = async () => {
    try {
      const res = await axios.get(`./api/question_daily?seed=${getUniqueValueForToday()}`);
      console.log(res.data);
      setQuestion(res.data);
      setLoading(false);

      // try {
      //   // Reference to the document
      //   const collectionRef = collection(db, "daily-question");
    
      //   // Data to be inserted
      //   const data = {
      //     answer: res.data.answer,
      //     category: res.data.category.title,
      //     date: getUniqueValueForToday(),
      //     fun_fact: res.data.details.funFact,
      //     hint1: res.data.details.hints.hint1,
      //     hint2: res.data.details.hints.hint2,
      //     hint3: res.data.details.hints.hint3,
      //     hint4: "",
      //     img_src: res.data.img.source,
      //     img_h: res.data.img.height,
      //     img_w: res.data.img.width,
      //     question: res.data.details.question
      //   };
    
      //   // Set the document with the data
      //   await addDoc(collectionRef, data);
      //   console.log("Document successfully written!");
      // } catch (e) {
      //   console.error("Error adding document: ", e);
      // }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <div className="center-div" style={{display: "flex", flexDirection: "row"}}>
        {!mobile ? (
          <div style={{flex: 0.25}}>
            <h3 style={{marginTop: 78}}>DWC</h3>
            <div className="light-line" style={{width: "75%"}}/>
            <MenuBar position={0}/>
          </div>
        ) : null}
        <div style={{flex: 1}}>
        <div style={{display: "flex"}}>
          <h1 className="title">Daily Wiki Challenge</h1>
          <div style={{flex: 1}}/>
        </div>
        <div className="line"/>
        <div style={{display: "flex"}}>
        <p className="small-text">{`${day} ${month} ${year}`}</p>
        <div style={{flex: 1}}/>
          <p style={{whiteSpace: "nowrap"}}><b>⭐:</b> {score} <b>🔥:</b> {streak}</p>
        </div>
        <div className="light-line"></div>
        {mobile ? (
          <div>
            <MobileMenuBar position={0}/>
            <div style={{marginTop: 0}} className="light-line"></div>
          </div>
        ): null}

          <div style={{ 
              display: "flex", 
              flexDirection: mobile ? "column-reverse" : "row", // Default to row direction
              flexWrap: "wrap", // Ensure items wrap if needed
            }}>
              <div style={{ 
                flex: "0.75", 
                minWidth: "200px", // Ensure it has some minimum width for visibility
              }}>
                {loading ? (
                  <p style={{marginTop: 40}}>Loading Question...</p>
                ) : (
                  <div style={{marginTop: 40}}>
                    <p>{question.details.question}</p>
                    {question.img.source !== null &&
                      <div style={{marginTop: 50, display: "flex", justifyContent: "center"}}>
                        <Image 
                          src={question.img.source} 
                          alt="Question Image"
                          width={mobile ? 350 : 500}
                          height={calculateHeight(question.img.width, question.img.height, mobile ? 350 : 500)}
                        />
                      </div>}
                      <div style={{marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center"}}>
                          {answerState !== 1 && <AnswerBar onAnswerSubmit={onAnswerSubmit}/>}
                          {answerState == -1 && 
                            <div style={{marginTop: "25", backgroundColor: "#EB5757", paddingLeft: 5, paddingRight: 5, width: '80%', display: "flex", flexDirection: "column", alignItems: "center"}}>
                              <p style={{marginTop: 5, marginBottom: 5}}><b>Incorrect</b></p>
                            </div>}
                          {answerState == 1 && <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: "100%"}}>
                            <h3>{question.answer}</h3>
                            <div style={{marginTop: "25", backgroundColor: "#219653", paddingLeft: 5, paddingRight: 5, width: '80%', display: "flex", flexDirection: "column", alignItems: "center"}}>
                              <p style={{marginTop: 5, marginBottom: 5}}><b>Correct</b></p>
                            </div>
                            <div style={{width: "100%"}}>
                              <p style={{marginTop: 50}}><b>Fun Fact<br/> </b>{question.details.funFact}</p>
                              <a href={`https://en.wikipedia.org/wiki/${question.answer.replace(/ /g, "_")}`} target="_blank"><p>Read More</p></a>
                            </div>
                            <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                                <p><i>Come back tomorrow for the next Daily Wiki Challenge!</i></p>
                            </div>
                          </div>}
                      </div>
                  </div>
                )}
            </div>
            {!loading ? (
              <div style={{ 
                flex: "0.25", 
                minWidth: "100px", // Ensure it has some minimum width for visibility
              }}>
                <HintBox hint1={question.details.hints.hint1} cat1={question.categories.category1} hint2={question.details.hints.hint2} cat2={question.categories.category2} hint3={question.details.hints.hint3} cat3={question.categories.category3}/>
              </div>
            ):null}
          </div>
        </div>
      </div>
    </main>
  );
}