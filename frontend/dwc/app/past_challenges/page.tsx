'use client';

import { useState , useEffect } from "react";
import MobileMenuBar from '../components/MobileMenuBar';
import MenuBar from '../components/MenuBar';
import SearchBar from '../components/searchBar';
import DateSelector from '../components/dateSelector';
import ChallengeItem from '../components/challengeItem';
import { DocumentData, CollectionReference, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from '../../lib/firebaseConfig';

export default function Home() {

    const [mobile, setMobile] = useState(window.innerWidth < 1000 ? true : false);
    const [loading, setLoading] = useState(true);
    const [challengeList, setChallengeList] = useState<{ id: string }[]>([]);

    useEffect(()=>{

        const handleResize = () => {
          setMobile(window.innerWidth < 1000 ? true : false);
        };
      
        // Attach the event listener
        window.addEventListener('resize', handleResize);


        const fetchChallengeData = async () => {
            try {
                const collectionRef: CollectionReference<DocumentData> = collection(db, "daily-question");
                const q = query(collectionRef, orderBy("date", "desc"))
                const querySnapshot = await getDocs(q);

                // Map document data to an array
                const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                if (docs.length > 0) {
                    console.log(docs);
                    setChallengeList(docs);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error getting documents: ", error);
                throw new Error("Failed to retrieve documents");
            }
        }

        fetchChallengeData();
      // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, [])

    return(
    <main className="container">
        <div className="center-div" style={{display: "flex", flexDirection: "row"}}>
            {!mobile ? (
            <div style={{flex: 0.25}}>
                <h3 style={{marginTop: 78}}>DWC</h3>
                <div className="light-line" style={{width: "75%"}}/>
                <MenuBar position={2}/>
                {!loading && <DateSelector list={challengeList}/>}
            </div>
            ) : null}
            <div style={{flex: 1}}>
            <div style={{display: "flex"}}>
            <h1 className="title">Daily Wiki Challenge</h1>
            <div style={{flex: 1}}/>
            </div>
            <div className="line"/>
            <div className="light-line" style={{marginTop: 47}}/>
            {mobile ? (
            <div>
                <MobileMenuBar position={2}/>
                <div style={{marginTop: 0}} className="light-line"></div>
            </div>
            ): null}

            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={{marginTop: 15}}>
                       <SearchBar list={challengeList} onSearchFilter={()=>{}}/>
                       {challengeList.map((item, i) => (
                            <ChallengeItem key={i} item={item} />
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
        </main>
    )
}