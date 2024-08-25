'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, updateDoc, getDoc, query, where, doc, addDoc } from "firebase/firestore";
import axios from 'axios';

const date = new Date();
const day = date.getDate();
const month = date.toLocaleString('default', { month: 'long' });
const year = date.getFullYear();

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Calculate the aspect ratio
  const ratio: number = originalHeight / originalWidth;
  
  // First calculate based on maxHeight
  let newHeight: number = Math.min(originalHeight, maxHeight);
  let newWidth: number = newHeight / ratio;
  
  // If the new width exceeds maxWidth, adjust based on maxWidth
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth * ratio;
  }

  return { width: newWidth, height: newHeight };
}

export default function Home() {
  const [loading, setLoading] = useState(true);
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
  const fetchQuestionData = async () => {

    try {
        const fetchQuestionData = async () => {
            const q = query(collection(db, "daily-question"), where("date", "==", getUniqueValueForToday()));
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map((doc) => doc.data());
    
            if (docs.length > 0) {
              const question = docs[0];
              setQuestion({
                answer: question.answer, 
                details: {
                  question: question.question, 
                  category: question.category, 
                  hints: {
                    hint1: question.hint1, 
                    hint2: question.hint2, 
                    hint3: question.hint3,
                  }, 
                  difficulty: 'medium',
                  funFact: question.fun_fact,
                }, 
                img: {
                  source: question.img_src, 
                  height: question.img_h, 
                  width: question.img_w
                }
              });
              setLoading(false);
            } else {
              loadQuestion();
            }
        };
    
        fetchQuestionData();
     
    } catch (error) {
      console.error('Error fetching or creating account data:', error);
    }
  };

  fetchQuestionData();
}, [])

function getUniqueValueForToday() {
  const date = new Date();
  const year = date.getFullYear();
  // getMonth() returns month starting from 0, so we add 1 to get the correct month number
  const month = ('0' + (date.getMonth() + 1)).slice(-2); 
  const day = ('0' + date.getDate()).slice(-2);
  return year + month + day;
}

  const loadQuestion = async () => {
    try {
      const res = await axios.get(`./api/question_daily?seed=${getUniqueValueForToday()}`);
      console.log(res.data);
      setQuestion(res.data);
      setLoading(false);

      try {
        // Reference to the document
        const collectionRef = collection(db, "daily-question");
    
        // Data to be inserted
        const data = {
          answer: res.data.answer,
          category: res.data.category.title,
          date: getUniqueValueForToday(),
          fun_fact: res.data.details.funFact,
          hint1: res.data.details.hints.hint1,
          hint2: res.data.details.hints.hint2,
          hint3: res.data.details.hints.hint3,
          hint4: "",
          img_src: res.data.img.source,
          img_h: res.data.img.height,
          img_w: res.data.img.width,
          question: res.data.details.question
        };
    
        // Set the document with the data
        await addDoc(collectionRef, data);
        console.log("Document successfully written!");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <div className="center-div">
        <div style={{ display: "flex" }}>
          <h1 className="title">Daily Wiki Challenge</h1>
          <div style={{ flex: 1 }} />
        </div>
        <div className="line" />
        <div style={{ display: "flex", marginTop: -10, marginBottom: -10 }}>
          <p className="small-text">{`${day} ${month} ${year}`}</p>
        </div>
        <div className="line" />
        {loading ? (
          <p>Loading Question...</p>
        ) : (
          <div className="question-container">
            <p>{question.details.question}</p>
            {question.img.source && (
              <div className="image-container">
                <Image
                  src={question.img.source}
                  alt="Question Image"
                  width={calculateDimensions(question.img.width, question.img.height, 325, 225).width}
                  height={calculateDimensions(question.img.width, question.img.height, 325, 225).height}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );  
}
