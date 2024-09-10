import { useState, useEffect } from 'react';
import LinkBarItem from './linkbarItem';

export default function MobileMenuBar({position}) {
    return(
        <div style={{display: "flex"}}>
            <LinkBarItem link={"/"} selected={position == 0 ? true : false} text={"Today's Challenge"}/>
            <LinkBarItem link={"/about"} selected={position == 1 ? true : false} text={"About DWC"}/>
            <LinkBarItem link={"/past_challenges"} selected={position == 2 ? true : false} text={"Past Challenges"}/>
      </div>
    )
}