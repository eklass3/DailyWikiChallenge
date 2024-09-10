import { useState, useEffect } from 'react';
import LinkBarItem from './linkbarItem';

export default function MobileMenu({position}) {
    return(
        <div style={{marginTop: 40}}>
            <a href="/" style={{ textDecoration: 'none' }}>
                {position === 0 ? (
                    <h1 style={{ fontSize: 18, color: "#007AFF", marginLeft: 15 }}>
                    • Daily Wiki Challenge
                    </h1>
                ) : (
                    <h1 style={{ fontSize: 18, marginLeft: 25 }}>
                    Daily Wiki Challenge
                    </h1>
                )}
            </a>
            <a href="/about" style={{ textDecoration: 'none' }}>
                {position === 1 ? (
                    <h1 style={{ fontSize: 18, color: "#007AFF", marginLeft: 15 }}>
                    • About DWC
                    </h1>
                ) : (
                    <h1 style={{ fontSize: 18, marginLeft: 25 }}>
                    About DWC
                    </h1>
                )}
            </a>
            <a href="/past_challenges" style={{ textDecoration: 'none' }}>
                {position === 2 ? (
                    <h1 style={{ fontSize: 18, color: "#007AFF", marginLeft: 15 }}>
                    • Past Challenges
                    </h1>
                ) : (
                    <h1 style={{ fontSize: 18, marginLeft: 25 }}>
                    Past Challenges
                    </h1>
                )}
            </a>
        </div>
    )
}