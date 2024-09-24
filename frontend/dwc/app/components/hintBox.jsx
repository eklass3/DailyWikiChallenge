import { useState, useEffect } from 'react';
import Countdown from './countdown';

// Helper functions to check time
const isPastTime = (targetHour, targetMinute) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return (currentHour > targetHour) || (currentHour === targetHour && currentMinute >= targetMinute);
};
  

export default function HintBox({hint1, cat1, hint2, cat2, hint3, cat3, countDown}) {

    const [isPast11AM, setIsPast11AM] = useState(isPastTime(11, 0));
    const [isPast4PM, setIsPast4PM] = useState(isPastTime(16, 0));
    const [isPast9PM, setIsPast9PM] = useState(isPastTime(21, 0));

    const handleCountdownComplete = () => {
        //NOTE: this are one minute behind to account for any lag in the timer on the hint component. This is not a problem as this function is only called when the hint component timer reaches 0 for any hint.
        setIsPast11AM(isPastTime(10, 59));
        setIsPast4PM(isPastTime(15, 59));
        setIsPast9PM(isPastTime(20, 59));
    }

    return(
        <div style={{width: "100%", backgroundColor: "#F8F9FA", border: "2px solid #D0D4D8", marginTop: 50}}>
            <div style={{marginTop: 15, marginBottom: 15, marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center", backgroundColor: "#D9D9D9"}}>
                <h3 style={{marginTop: 5, marginBottom: 5}}>Hint 1</h3>
            </div>
                {isPast11AM || !countDown ? (
                <div>
                <p style={{marginLeft: 10, marginRight: 10}}>{hint1}</p>
                 <div style={{display: "flex", marginTop: 15, marginLeft: 10, marginRight: 10}}>
                    <p style={{flex: 0.25, marginRight: 5}}><b>Category</b></p>
                    <a href={`https://en.wikipedia.org/wiki/${cat1.replace(/ /g, "_")}`} style={{ textDecoration: 'none' }} target="_blank"><p style={{flex: 0.75}}>{cat1.replace("Category:","")}</p></a>
                </div>
                </div>
                ) : (
                    <div style={{marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center"}}>
                        <Countdown target={'11:00'} onCountdownComplete={handleCountdownComplete}/>
                    </div>
                )}
            <div style={{marginTop: 15, marginBottom: 15, marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center", backgroundColor: "#D9D9D9"}}>
                <h3 style={{marginTop: 5, marginBottom: 5}}>Hint 2</h3>
            </div>
                {isPast4PM || !countDown ? (
                    <div>
                    <p style={{marginLeft: 10, marginRight: 10}}>{hint2}</p>
                    <div style={{display: "flex", marginTop: 15, marginLeft: 10, marginRight: 10}}>
                        <p style={{flex: 0.25, marginRight: 5}}><b>Category</b></p>
                        <a href={`https://en.wikipedia.org/wiki/${cat2.replace(/ /g, "_")}`} style={{ textDecoration: 'none' }} target="_blank"><p style={{flex: 0.75}}>{cat2.replace("Category:","")}</p></a>
                    </div>
                    </div>
                    ) : (
                        <div style={{marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center"}}>
                            <Countdown target={'16:00'} onCountdownComplete={handleCountdownComplete}/>
                        </div>
                    )}
            <div style={{marginTop: 15, marginBottom: 15, marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center", backgroundColor: "#D9D9D9"}}>
                <h3 style={{marginTop: 5, marginBottom: 5}}>Hint 3</h3>
            </div>
            {isPast9PM || !countDown ? (
                    <div>
                    <p style={{marginLeft: 10, marginRight: 10}}>{hint3}</p>
                    <div style={{display: "flex", marginTop: 15, marginLeft: 10, marginRight: 10}}>
                        <p style={{flex: 0.25, marginRight: 5}}><b>Category</b></p>
                        <a href={`https://en.wikipedia.org/wiki/${cat3.replace(/ /g, "_")}`} style={{ textDecoration: 'none' }} target="_blank"><p style={{flex: 0.75}}>{cat3.replace("Category:","")}</p></a>
                    </div>
                    </div>
                    ) : (
                        <div style={{marginLeft: 10, marginRight: 10, display: "flex", justifyContent: "center"}}>
                            <Countdown target={'21:00'} onCountdownComplete={handleCountdownComplete}/>
                        </div>
                    )}
            </div>
    )
}