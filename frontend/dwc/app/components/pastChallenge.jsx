import { useState, useEffect } from 'react';
import Image from 'next/image';
import HintBox from './hintBox';

function calculateHeight(originalWidth, originalHeight, newWidth) {
    const ratio = originalHeight / originalWidth;
    const newHeight = newWidth * ratio;
    return newHeight;
}
  

export default function PastChallenge({challenge, mobile}) {

    return(
        <div style={{ 
            display: "flex", 
            flexDirection: mobile ? "column-reverse" : "row", // Default to row direction
            flexWrap: "wrap", // Ensure items wrap if needed
          }}>
            <div style={{ 
              flex: "0.75", 
              minWidth: "200px", // Ensure it has some minimum width for visibility
            }}>
                <div style={{marginTop: 40}}>
                <p>{challenge.question}</p>
                {challenge.img_src !== null &&
                <div style={{marginTop: 50, display: "flex", justifyContent: "center"}}>
                    <Image 
                    src={challenge.img_src} 
                    alt="Question Image"
                    width={mobile ? 350 : 500}
                    height={calculateHeight(challenge.img_w, challenge.img_h, mobile ? 350 : 500)}
                    />
                </div>}
                <div style={{marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: "100%"}}>
                        <h3>{challenge.answer}</h3>
                        <div style={{width: "100%"}}>
                        <p style={{marginTop: 50}}><b>Fun Fact<br/> </b>{challenge.fun_fact}</p>
                        <a href={`https://en.wikipedia.org/wiki/${challenge.answer.replace(/ /g, "_")}`} target="_blank"><p>Read More</p></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style={{ 
                flex: "0.25", 
                minWidth: "100px", // Ensure it has some minimum width for visibility
              }}>
                {challenge.category1 !== undefined ? (
                     <HintBox countDown={false} hint1={challenge.hint1} cat1={challenge.category1} hint2={challenge.hint2} cat2={challenge.category2} hint3={challenge.hint3} cat3={challenge.category3}/>
                ) : (
                    <HintBox countDown={false} hint1={challenge.hint1} cat1={challenge.category} hint2={challenge.hint2} cat2={""} hint3={challenge.hint3} cat3={""}/>
                )}
               
            </div>
        </div>
    )
}