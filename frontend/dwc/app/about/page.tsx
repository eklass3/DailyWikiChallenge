'use client';

import { useState , useEffect } from "react";
import MobileMenuBar from '../components/MobileMenuBar';
import MenuBar from '../components/MenuBar';

const VERSION_CODE = "Beta 0.0.4"

export default function Home() {

    const [mobile, setMobile] = useState<any>(null);

    useEffect(()=>{

        const handleResize = () => {
          setMobile(window.innerWidth < 1000 ? true : false);
        };
      
        // Attach the event listener
        window.addEventListener('resize', handleResize);
        setMobile(window.innerWidth < 1000 ? true : false);
      // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, [])

    if (mobile !== null) {
    return(
    <main className="container">
        <div className="center-div" style={{display: "flex", flexDirection: "row"}}>
            {!mobile ? (
            <div style={{flex: 0.25}}>
                <h3 style={{marginTop: 78}}>DWC</h3>
                <div className="light-line" style={{width: "75%"}}/>
                <MenuBar position={1}/>
            </div>
            ) : null}
            <div style={{flex: 1}}>
            <div style={{display: "flex"}}>
            <h1 className="title">Daily Wiki Challenge</h1>
            <div style={{flex: 1}}/>
            </div>
            <div className="line"/>
            {mobile ? (
            <div>
                <MobileMenuBar position={1}/>
                <div style={{marginTop: 0}} className="light-line"></div>
            </div>
            ): null}

            <div style={{ 
                display: "flex", 
                flexWrap: "wrap", // Ensure items wrap if needed
                }}>
                    <p style={{maxWidth: 1000, lineHeight: 1.5}}>Daily Wiki Challenge is a ML driven trivia game based on the vast amount of public data available through Wikipedia. The goal of the game is to determine what article the question is referencing. The answer will always be a title of a Wikipedia article. The objective of this game is to have a new and fun way to learn from Wikipedia.</p>
                    <p style={{maxWidth: 1000, lineHeight: 1.5}}>This mode displays a new trivia question everyday based on current world events and popular Wikipedia articles. You have unlimited guesses to try to figure out what the answer article is. A new hint is released at <b>11:00</b>, <b>14:00</b>, and <b>21:00</b> each day. However, with each hint there will be a reduction in the number of stars you can win: no hints = 5x⭐, 1 hint = 3x⭐, 2 hints = 2x⭐, and 3 hints = 1x⭐. So try to answer early. Build your daily streak (🔥) by answering questions for consecutive days. Take advantage of categories provided in hints to help narrow your research.</p>
                    <p style={{maxWidth: 1000, lineHeight: 1.5}}>For all game modes you will probably notice the occasional odd wording in the questions. This is typical GPT LLM growing pains. I’m hoping it will improve as time goes on, and I improve my prompts! My best tip for new players – think from the perspective of browsing Wikipedia. All the answers are actual Wikipedia article titles, so they may not be what you expect!</p>
                    <p style={{maxWidth: 1000, lineHeight: 1.5}}>Daily Wiki Challenge was designed and engineered by <a href={"https://www.linkedin.com/in/eric-klassen-551616205/"} target="_blank">Eric Klassen</a> using Python Flask, OpenAI GPT4, and Next.js. Feel free to send me a message if you have any suggestions: eaklassen8 [at] gmail.com. Follow along with the daily challenges on Instagram - @dailywikichallenge</p>
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <p><b>DWC Version: {VERSION_CODE}</b></p>
                 </div>
                </div>     
            </div>
        </div>
        </main>
    )
    } else {
        return (<div/>)
    }
}