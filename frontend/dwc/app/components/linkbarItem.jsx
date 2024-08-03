import { useState, useEffect } from 'react';

export default function LinkBarItem({link, selected, text}) {
    if (selected) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <p style={{
                    marginRight: 7, 
                    marginLeft: 7,
                    fontSize: 14
                    }}>{text}</p>
                <div style={{height: 2, width: '80%', backgroundColor: '#000000', marginTop: -10}}/>
            </div>
        )
    } else {
        return (
                <a href={link} style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p style={{
                        marginRight: 7, 
                        marginLeft: 7,
                        fontSize: 14,
                        color: 'blue'
                        }}>{text}</p>
                    <div className="hover-line" style={{height: 2, width: '80%', backgroundColor: 'blue', marginTop: -10}}/>
                </a>
        )
    }
}