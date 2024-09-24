'use client';

import { useState , useEffect } from "react";
import MobileMenuBar from '../components/MobileMenuBar';
import MenuBar from '../components/MenuBar';
import SearchBar from '../components/searchBar';
import DateSelector from '../components/dateSelector';
import ChallengeItem from '../components/challengeItem';
import PastChallenge from '../components/pastChallenge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DocumentData, CollectionReference, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from '../../lib/firebaseConfig';
import { styled } from '@mui/material/styles';

let staticChallengeList: { id: string }[] = [];

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
    // Style the input
    '& .MuiInputBase-root': {
      height: '40px', // Adjust the height of the input field
      marginLeft: '15px',
    },
    // Style the calendar popover if needed
    '& .MuiPopover-paper': {
      height: 'auto', // You can adjust the height of the calendar popover here
    }
  }));

export default function Home() {

    const [mobile, setMobile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [challengeList, setChallengeList] = useState<{ id: string }[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<any>({});

    useEffect(()=>{

        const handleResize = () => {
          setMobile(window.innerWidth < 1000 ? true : false);
        };
      
        // Attach the event listener
        window.addEventListener('resize', handleResize);
        setMobile(window.innerWidth < 1000 ? true : false);

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
                    staticChallengeList = docs;
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
    }, []);

    function updateChallengeList(filteredList: any) {
        setChallengeList(filteredList);
    }

    function formatDate(yyyymmdd: String) {
        // Ensure the input is a string and has the correct length
        if (typeof yyyymmdd !== 'string' || yyyymmdd.length !== 8) {
            throw new Error('Invalid date format. Expected YYYYMMDD.');
        }
    
        // Extract year, month, and day from the input string
        const year = yyyymmdd.substring(0, 4);
        const month = parseInt(yyyymmdd.substring(4, 6), 10); // Convert to number
        const day = parseInt(yyyymmdd.substring(6, 8), 10);   // Convert to number
    
        // Array of month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        // Ensure the month is within the valid range
        if (month < 1 || month > 12) {
            throw new Error('Invalid month value.');
        }
    
        // Format the date as "Month Day, Year"
        return `${day} ${monthNames[month - 1]} ${year}`;
    }

    function filterDays(d: number, m: number, y: number) {

        function formatToTwoDigits(number: number) {
            return number.toString().padStart(2, '0');
        }

        console.log("day "+ formatToTwoDigits(d) + " month " + formatToTwoDigits(m) + " year " + y);
        let filteredList = staticChallengeList.filter((item: any) => item.date === (y + "" + formatToTwoDigits(m) + "" + formatToTwoDigits(d)));
        setChallengeList(filteredList);
    }
    

    if (mobile !== null) {
        return(
        <main className="container">
            <div className="center-div" style={{display: "flex", flexDirection: "row"}}>
                {!mobile ? (
                <div style={{flex: 0.25}}>
                    <h3 style={{marginTop: 78}}>DWC</h3>
                    <div className="light-line" style={{width: "75%"}}/>
                    <MenuBar position={2}/>
                    {!loading && !searching && <DateSelector list={staticChallengeList} onListFilter={(filteredList: any)=>{updateChallengeList(filteredList); setSelectedChallenge({});}}/>}
                </div>
                ) : null}
                <div style={{flex: 1}}>
                <div style={{display: "flex"}}>
                <h1 className="title">Daily Wiki Challenge</h1>
                <div style={{flex: 1}}/>
                </div>
                <div className="line"/>
                {Object.keys(selectedChallenge).length > 0 && <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                    
                        <p className="small-text">Historic challenge from <i>{formatDate(selectedChallenge.date)}</i></p>
                        <div style={{marginTop: -3}} className="light-line"/>
                    </div>}
                {mobile ? (
                <div>
                    <MobileMenuBar position={2}/>
                    <div style={{marginTop: 0}} className="light-line"></div>
                </div>
                ): null}

                {Object.keys(selectedChallenge).length > 0 ? (
                    <PastChallenge challenge={selectedChallenge} mobile={mobile} />
                ) : (
                <div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div style={{marginTop: 15}}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{flex: !mobile ? 1 : 0.6}}>
                                <SearchBar list={staticChallengeList} onSearch={(search: boolean)=>setSearching(search)} onSearchFilter={(filteredList: any)=>{setChallengeList(filteredList)}}/>
                                </div>
                                {mobile && <div style={{flex: 0.4}}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <StyledDatePicker onAccept={(value: any, c) => filterDays(value.$D, (value.$M+1), value.$y)}/>
                                </LocalizationProvider>
                                </div>}
                        </div>
                        {challengeList.length > 0 ? challengeList.map((item, i) => (
                                <ChallengeItem key={i} item={item} onSelect={(challenge: any)=>setSelectedChallenge(challenge)} />
                            )) : (
                                <p>No results</p>
                            )}
                        </div>
                    )}
                    </div>
                
                )}
                </div>
            </div>
            </main>
        )
    } else {
        <div/>
    }
}